/**
 * Utility to encode strings in base64url format.
 * @param {string} str Input string.
 * @returns {string} Base64url encoded string.
 */
function base64UrlEncode(str) {
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/**
 * Utility to encode an ArrayBuffer in base64url format.
 * @param {ArrayBuffer} buffer Input buffer.
 * @returns {string} Base64url encoded string.
 */
function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/**
 * Generates and signs a LiveKit-compatible JWT token client-side using HS256 algorithm via the native browser Web Crypto API.
 * @param {string} apiKey LiveKit API Key.
 * @param {string} apiSecret LiveKit API Secret.
 * @param {object} options Token generation properties:
 * @param {string} options.room The LiveKit Room ID.
 * @param {string} options.identity Unique identifier for the participant (e.g. user ID).
 * @param {string} [options.name] Human-readable name (e.g. user name).
 * @param {string} [options.metadata] Custom metadata string.
 * @param {boolean} [options.canPublish] Whether participant can publish tracks (true for GM, false for players).
 * @param {boolean} [options.canSubscribe] Whether participant can subscribe to tracks (always true).
 * @returns {Promise<string>} The signed JWT token string.
 */
export async function generateLiveKitToken(apiKey, apiSecret, options = {}) {
  const cleanApiKey = apiKey?.trim();
  const cleanApiSecret = apiSecret?.trim();

  if (!cleanApiKey || !cleanApiSecret) {
    throw new Error("LiveKit API Key and API Secret must not be empty.");
  }

  const {
    room,
    identity,
    name,
    metadata,
    canPublish = false,
    canSubscribe = true
  } = options;

  const now = Math.floor(Date.now() / 1000);
  const expiration = now + 2 * 60 * 60; // 2 hours validity

  const claims = {
    iss: cleanApiKey,
    sub: identity,
    nbf: now - 600,
    exp: expiration,
    video: {
      roomJoin: true,
      room: room,
      canPublish: canPublish,
      canSubscribe: canSubscribe,
      canPublishData: canPublish
    }
  };

  if (name) claims.name = name;
  if (metadata) claims.metadata = metadata;

  const header = { alg: "HS256", typ: "JWT" };

  const headerStr = base64UrlEncode(JSON.stringify(header));
  const payloadStr = base64UrlEncode(JSON.stringify(claims));
  const message = `${headerStr}.${payloadStr}`;

  const maskedSecret = cleanApiSecret.length > 6 
    ? `${cleanApiSecret.substring(0, 3)}...${cleanApiSecret.substring(cleanApiSecret.length - 3)}` 
    : "...";
  console.log(`Screen Share | Signing JWT with API Key: ${cleanApiKey} and API Secret: ${maskedSecret}`);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(cleanApiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const signatureStr = arrayBufferToBase64Url(signatureBuffer);

  return `${message}.${signatureStr}`;
}
