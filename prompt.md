Act as an expert Foundry VTT module developer and software architect. Create a complete, functional Foundry VTT v14 module called "Screen Share". 
The goal of this module is to allow the Gamemaster (GM) to share their screen directly onto the canvas, utilizing Foundry v14's Scene Regions to define the rendering area and shape. 
Please generate the necessary JavaScript code, considering the following requirements:

CRITICAL ARCHITECTURE REQUIREMENT: The module must be designed with a decoupled, pluggable transmission architecture using the Strategy or Adapter pattern. The core logic (UI, Canvas handling, PixiJS rendering) must not be hardcoded to a specific streaming technology. 
- Create a generic `StreamProvider` base class or interface with standard methods (e.g., `initialize()`, `startShare()`, `stopShare()`, `onStreamReceived()`).
- For this v1 release, implement only a `WebRTCProvider` class that extends this base class.
- The architecture must allow a developer to easily drop in a `LiveKitProvider` or `SocketProvider` in the future without touching the core module code.


1. UI & Scene Controls:
- Add a new tool button in the Scene Controls (left toolbar) under the Regions layer, restricted to GMs only.
- The control should have a toggle button to "Start/Stop Screen Share".
- When toggled ON, prompt the GM to select a screen/window using `navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })`.
- Add a custom Region Behavior or a flag in the Region configuration so the GM can designate ONE specific Region in the current scene as the "Screen Share Target".

1. The Initial Transmission Implementation (WebRTCProvider):
- Implement the `WebRTCProvider` using Foundry's native `game.socket` to handle WebRTC signaling (SDP offers, answers, and ICE candidates) between the GM and the connected clients.
- The GM acts as the sender, and all non-GM clients act as receivers.
- Ensure this logic is cleanly encapsulated within the `WebRTCProvider` class.

1. PixiJS Rendering & v14 Regions API:
- On the client side, the generic core module receives the MediaStream from the active `StreamProvider`.
- Attach the stream to a hidden HTML `<video>` element (muted, autoplay, playsinline).
- Convert this video element into a `PIXI.Texture.from()`.
- Locate the designated "Screen Share Target" Region Document on the canvas.
- Render the video texture onto the canvas using the exact polygon shape of the Region. Use a `PIXI.Sprite` or `PIXI.Graphics` with a `PIXI.Graphics` mask matching the Region's polygon to ensure the video is cropped/masked to the exact shape drawn by the GM.

1. Memory Management & Cleanup:
- When the GM stops the share, the core module calls `stopShare()` on the active provider, which emits the termination signal.
- Clients must properly destroy the `PIXI.Texture`, remove the `<video>` element from the DOM, and the provider must close any `RTCPeerConnection` to prevent WebGL memory leaks.
- Ensure the canvas cleanly repaints and the Region returns to its default state.

1. Code Structure:
- Provide the code in clean, well-commented ES6 classes. 
- Use Foundry's standard hooks (`init`, `ready`, `getSceneControlButtons`, `canvasReady`).
- Adhere strictly to Foundry V14 API changes (e.g., use `RegionDocument` and Application V2 if applicable).