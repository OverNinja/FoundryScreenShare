/**
 * Initialize settings on init hook.
 */
export function registerSettings() {
  game.settings.register("screen-share", "activeBackend", {
    scope: "client",
    config: false,
    type: String,
    default: "local"
  });

  game.settings.register("screen-share", "iceServers", {
    name: "WebRTC ICE Server URL",
    hint: "A single STUN or TURN server URL (e.g. stun:stun.l.google.com:19302).",
    scope: "world",
    config: true,
    type: String,
    default: "stun:stun.l.google.com:19302"
  });

  game.settings.register("screen-share", "turnUsername", {
    name: "WebRTC TURN Username",
    hint: "Username for authentication-based TURN servers.",
    scope: "world",
    config: true,
    type: String,
    default: ""
  });

  game.settings.register("screen-share", "turnCredential", {
    name: "WebRTC TURN Credential",
    hint: "Credential/Password for TURN authentication.",
    scope: "world",
    config: true,
    type: String,
    default: ""
  });

  game.settings.register("screen-share", "maxFramerate", {
    name: "Maximum Capture Framerate",
    hint: "Maximum capture framerate constraints for captured video streams.",
    scope: "client",
    config: true,
    type: Number,
    default: 0,
    choices: {
      0: "Auto",
      15: "15 FPS",
      30: "30 FPS",
      60: "60 FPS"
    }
  });

  game.settings.register("screen-share", "maxResolution", {
    name: "Maximum Capture Resolution",
    hint: "Maximum capture resolution height for the video stream.",
    scope: "client",
    config: true,
    type: String,
    default: "auto",
    choices: {
      "auto": "Auto",
      "720p": "720p (1280x720)",
      "1080p": "1080p (1920x1080)"
    }
  });

  game.settings.register("screen-share", "defaultFitMode", {
    name: "Default Video Fit Mode",
    hint: "The default fit mode for video streams rendered inside containers.",
    scope: "client",
    config: true,
    type: String,
    default: "contain",
    choices: {
      "contain": "Contain",
      "cover": "Cover",
      "fill": "Fill"
    }
  });

  game.settings.register("screen-share", "livekitServerUrl", {
    name: "LiveKit Server URL",
    hint: "The address of your LiveKit server (e.g. ws://localhost:7880 or wss://project.livekit.cloud).",
    scope: "world",
    config: true,
    restricted: true,
    type: String,
    default: "ws://localhost:7880"
  });

  game.settings.register("screen-share", "livekitApiKey", {
    name: "LiveKit API Key",
    hint: "The LiveKit API Key for token generation.",
    scope: "world",
    config: true,
    restricted: true,
    type: String,
    default: ""
  });

  game.settings.register("screen-share", "livekitApiSecret", {
    name: "LiveKit API Secret",
    hint: "The LiveKit API Secret for signing tokens (strictly hidden from players).",
    scope: "world",
    config: true,
    restricted: true,
    type: String,
    default: ""
  });

  game.settings.register("screen-share", "livekitRoomName", {
    name: "LiveKit Room Name",
    hint: "The room name where screen shares will be broadcasted.",
    scope: "world",
    config: true,
    restricted: true,
    type: String,
    default: "foundry-screen-share"
  });
}
