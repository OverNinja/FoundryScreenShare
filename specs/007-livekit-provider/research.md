# Research Notes: LiveKit Stream Provider

## Summary of Decisions

This document outlines key technical decisions made during research to support a secure, standalone LiveKit provider within Foundry VTT.

---

### Decision 1: LiveKit Client SDK Loading
- **Decision**: Dynamically load the LiveKit Client SDK from an ES Module CDN (`https://esm.sh/livekit-client` or a packaged equivalent) at runtime, or vendor a standalone ES module bundle at `src/lib/livekit-client.js` for offline compatibility.
- **Rationale**: The Screen Share module does not have an NPM-based build pipeline. By importing LiveKit Client via standard ES modules or vendoring, we keep the module 100% plug-and-play without requiring compilation tools.
- **Alternatives Considered**: 
  - Using npm and webpack/vite: Rejected due to introducing unnecessary build complexity to a pure JS Foundry module.
  - `<script>` tag in `module.json`: Rejected because ESM dynamic imports are cleaner and scope-restricted.

---

### Decision 2: Cryptographic JWT Library for GM Token Generation
- **Decision**: Implement a native Web Crypto API (`window.crypto.subtle`) HMAC-SHA256 signer.
- **Rationale**: LiveKit requires JWT tokens signed with the API Secret to connect. To keep the project free of heavy dependencies (like `jose` or `jsrsasign`) and compatible with offline environments, we can implement standard HS256 JWT generation using the browser's built-in Web Crypto API. This keeps the footprint tiny and execution lightning-fast.
- **Alternatives Considered**: 
  - Importing `jose`: Rejected due to size and potential ESM bundling issues in a native Foundry context.
  - Using `kjur-jsrsasign`: Rejected because native Web Crypto API is already present in all secure contexts (required anyway for screen sharing).

---

### Decision 3: GM-to-Player Token Exchange Protocol
- **Decision**: Use `game.socket` signaling for players to request and receive subscriber tokens from the GM.
- **Rationale**: Since the API Secret is stored in world-scoped, restricted settings, only the GM client can access it. When a player wants to connect, they request a token via `game.socket`. The GM client generates the token and sends it back to that player. The secret never leaves the GM's client, preventing any exposure to players.
- **Alternatives Considered**: 
  - Storing API Secret in player-readable settings: Rejected as a severe security risk.
  - Hosting an external server/cloud function: Rejected to keep the module fully self-contained and free of external runtime dependencies.

---

## Technical Details

### LiveKit JWT Payload Structure
For LiveKit authentication, the signed JWT payload must contain:
1. `iss` (Issuer): The LiveKit API Key.
2. `sub` (Subject): The user's ID or name (Foundry client user ID).
3. `exp` (Expiration): Unix timestamp (e.g., current time + 2 hours).
4. `video` (Grants):
   - For GM (Publisher): `{"roomJoin": true, "room": "<roomName>", "canPublish": true, "canSubscribe": true, "canPublishData": true}`
   - For Player (Subscriber): `{"roomJoin": true, "room": "<roomName>", "canPublish": false, "canSubscribe": true}`

### HS256 JWT Signing with Web Crypto API
The JWT token consists of:
`base64Url(Header) + "." + base64Url(Payload) + "." + base64Url(Signature)`
Where:
- Header is `{"alg": "HS256", "typ": "JWT"}`
- Signature is `HMAC-SHA256(apiSecret, Header + "." + Payload)`

We can write a helper to sign this data:
```javascript
async function generateJWT(apiKey, apiSecret, claims) {
  const encoder = new TextEncoder();
  const header = { alg: "HS256", typ: "JWT" };
  
  const cleanBase64 = (str) => btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  
  const part1 = cleanBase64(JSON.stringify(header));
  const part2 = cleanBase64(JSON.stringify(claims));
  const message = `${part1}.${part2}`;
  
  const key = await crypto.subtle.importKey(
    "raw", 
    encoder.encode(apiSecret),
    { name: "HMAC", hash: "SHA-256" }, 
    false, 
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureString = String.fromCharCode.apply(null, signatureArray);
  const part3 = cleanBase64(signatureString);
  
  return `${message}.${part3}`;
}
```
*(Note: standard Uint8Array to string base64url conversion is used to ensure compatibility with standard JWT parsers)*
