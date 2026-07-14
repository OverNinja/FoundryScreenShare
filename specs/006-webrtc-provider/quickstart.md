# Quickstart & Verification Guide: WebRTC Stream Provider

This guide outlines the steps to verify the WebRTC Stream Provider implementation manually in a local Foundry VTT environment.

## Prerequisites

1. **Foundry VTT v14** running on `localhost` or a secure host (HTTPS is required for browser media capture APIs).
2. **Two active browser sessions**:
   - Browser A: Logged in as a Gamemaster (GM).
   - Browser B: Logged in as a Player (non-GM).
3. **Module Configured**: The screen share module must be active.

---

## Setup & Configuration

1. **Enable WebRTC Backend**:
   - In the GM browser, click the gear icon on the screen share toolbar ("Select Streaming Backend").
   - Select **WebRTC Screen Share** from the dropdown and click "Save Selection".
2. **Verify Settings**:
   - Go to `Game Settings` -> `Configure Settings` -> `Screen Share settings`.
   - Verify that the default ICE server list is populated (e.g., `[{"urls":"stun:stun.l.google.com:19302"}]`).
   - (Optional) Configure custom TURN credentials to test relay functionality.

---

## Test Execution & Verification

### Scenario 1: Multi-Peer Screen Sharing (GM to Player)

1. **Mark Screen Container**:
   - In the GM browser, create or configure a Scene Region or Tile.
   - Open its appearance config sheet, check **Screen Share Container**, and save.
2. **Start Sharing**:
   - On the left controls toolbar, select the Screen Share control group.
   - Click the Desktop icon ("Start/Stop Screen Share").
   - The browser will show a media sharing dialog. Choose any window/screen to share.
   - Verify that the GM's canvas container renders the screen capture correctly.
3. **Player Verification**:
   - Switch to the Player browser (Browser B).
   - Verify that the player client automatically receives the track, establishes connection, and renders the video stream precisely within the marked Region/Tile boundaries on their canvas.
   - Open browser developer tools (F12) and type `webrtc` (in Chrome: `chrome://webrtc-internals/`) to verify that an active peer connection is running with `live` media tracks.

### Scenario 2: Late-Joiner Negotiation

1. **With Screen Share Active**:
   - Refresh the Player browser (Browser B) or log in a second player.
   - Verify that the new player's client automatically sends a `request-offer` signaling message on startup.
   - Verify that the GM client receives this request, initiates a new peer connection, and negotiates connection successfully.
   - Verify that the player sees the live stream without the GM needing to restart screen sharing.

### Scenario 3: Graceful Teardown and Cleanup

1. **Stop Sharing**:
   - In the GM browser, click the Desktop icon again to stop sharing.
   - Verify that the GM's canvas container restores its original texture/render.
2. **Verify Player Cleanup**:
   - Switch to the Player browser (Browser B).
   - Verify that the video stream disappears immediately.
   - Verify that the canvas container is restored to its default state.
   - Check the DOM and ensure that the off-screen `<video>` element created for the stream has been completely removed.
   - Inspect console logs to confirm that all `RTCPeerConnection` instances have been closed.
