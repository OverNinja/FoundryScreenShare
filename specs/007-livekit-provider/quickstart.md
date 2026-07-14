# Quickstart Validation Guide: LiveKit Stream Provider

This guide outlines the setup and validation scenarios to test the LiveKit Stream Provider integration end-to-end within a local development environment.

---

## Prerequisites

1. **Foundry VTT Instance**: Running locally on `http://localhost:30000` (or another designated port).
2. **Secure Context**: Localhost or an HTTPS-enabled domain.
3. **LiveKit Server**: A running LiveKit server instance. You can run one locally in development mode:
   ```bash
   docker run --rm -p 7880:7880 -p 7881:7881 -p 7882:7882/udp \
     livekit/livekit-server \
     --dev \
     --key-file /dev/null
   ```
   *Note: In development/dev mode, the default API Key is `devkey` and API Secret is `secret`.*

---

## Configuration Setup

1. Log in to your local Foundry VTT instance as a **Gamemaster (GM)**.
2. Navigate to **Module Settings** and open the configuration for **Screen Share**.
3. Configure the following LiveKit parameters:
   - **Active Backend**: Select `LiveKit Stream Share` (once registered).
   - **LiveKit Server URL**: `ws://localhost:7880` (or LiveKit cloud URL).
   - **LiveKit API Key**: `devkey`.
   - **LiveKit API Secret**: `secret`.
   - **LiveKit Room Name**: `screen-share-test`.
4. Click **Save Settings**.

---

## Validation Scenarios

### Scenario 1: GM Publishes Stream
**Objective**: Verify the GM can capture their screen, sign a publisher token client-side, and connect to LiveKit.

1. **Action**: Open the GM interface. Click the **Start Screen Share** tool on the canvas.
2. **Action**: Select a window, screen, or browser tab to share when the native browser dialog prompts.
3. **Expected Outcome**:
   - The browser console displays `Screen Share | Generating Publisher JWT...`.
   - The GM successfully connects to the LiveKit room.
   - The video track is successfully published to LiveKit.
   - The share indicator shows that stream publishing is active.

---

### Scenario 2: Player Receives Stream (Dual-Client Verification)
**Objective**: Verify player clients can request and receive subscriber tokens and view the GM's stream.

1. **Action**: Open a second browser window (e.g., incognito or different browser) and log in as a **Player (non-GM)** on the active scene.
2. **Action**: Start screen sharing on the GM client (following Scenario 1).
3. **Expected Outcome**:
   - The player client automatically emits a `request-livekit-token` socket message to the GM.
   - The GM client receives the request, generates a Subscriber JWT, and returns a `livekit-token` response over the socket.
   - The player client console displays: `Received token from GM. Connecting to LiveKit room...`.
   - The player client connects to the LiveKit room as a subscriber and subscribes to the GM's video track.
   - The video stream renders correctly inside the designated canvas container on the player's screen.
   - LiveKit API keys/secrets are checked in player settings and verified to be inaccessible (undefined/null for player user role).

---

### Scenario 3: Stream Disconnection and Cleanup
**Objective**: Verify clean resource deallocation when screen sharing stops.

1. **Action**: On the GM client, click the **Stop Screen Share** tool.
2. **Expected Outcome**:
   - The GM client closes local tracks and disconnects from the LiveKit room.
   - The GM client emits a `disconnect` message to all players via the socket.
   - The player clients immediately close their LiveKit room subscriptions, remove all `<video>` DOM elements, destroy all `PIXI.Texture` objects, and clear the rendering canvas.
   - Verified that no memory leaks or active WebRTC channels remain in both GM and player browser dev tools.
