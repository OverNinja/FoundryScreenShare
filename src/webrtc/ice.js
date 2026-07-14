/**
 * Generates the ICE servers configuration array from the module settings.
 * @returns {Array<RTCIceServer>}
 */
export function getIceServersConfig() {
  const rawIce = game.settings.get("screen-share", "iceServers");
  let iceUrl = "stun:stun.l.google.com:19302";

  if (rawIce) {
    const trimmed = rawIce.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        const firstServer = Array.isArray(parsed) ? parsed[0] : parsed;
        if (firstServer && firstServer.urls) {
          iceUrl = Array.isArray(firstServer.urls) ? firstServer.urls[0] : firstServer.urls;
        }
      } catch (err) {
        console.error("Screen Share | Failed to parse legacy iceServers JSON, using default:", err);
      }
    } else {
      iceUrl = trimmed;
    }
  }

  const server = { urls: iceUrl };
  const username = game.settings.get("screen-share", "turnUsername");
  const credential = game.settings.get("screen-share", "turnCredential");

  if (username || credential) {
    const isTurn = iceUrl.startsWith("turn:") || iceUrl.startsWith("turns:");
    if (isTurn) {
      if (username) server.username = username;
      if (credential) server.credential = credential;
    }
  }

  return [server];
}
