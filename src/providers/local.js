import { StreamProvider } from "./base.js";

/**
 * Concrete Stream Provider using the browser's native getDisplayMedia API.
 * @extends {StreamProvider}
 */
export class LocalStreamProvider extends StreamProvider {
  /** @type {MediaStream|null} */
  #stream = null;
  /** @type {Function|null} */
  #onEndedCallback = null;

  /**
   * @param {Function} onEndedCallback Callback fired when a media track is stopped externally.
   */
  constructor(onEndedCallback) {
    super();
    this.#onEndedCallback = onEndedCallback;
  }

  /** @override */
  async startStream() {
    if (this.#stream) return this.#stream;

    if (!navigator.mediaDevices) {
      const errorMsg = "Screen sharing is not supported in this browser context. It requires a secure context (HTTPS or localhost).";
      ui.notifications.error(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      this.#stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
    } catch (err) {
      throw err;
    }

    const videoTrack = this.#stream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.addEventListener("ended", () => {
        if (this.#onEndedCallback) this.#onEndedCallback();
      });
    }

    return this.#stream;
  }

  /** @override */
  async stopStream() {
    this.#onEndedCallback = null;
    if (!this.#stream) return;
    for (const track of this.#stream.getTracks()) {
      track.stop();
    }
    this.#stream = null;
  }

  /** @override */
  get isActive() {
    return this.#stream !== null && this.#stream.getVideoTracks().some(t => t.readyState === "live");
  }
}
