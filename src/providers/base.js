/**
 * Abstract Stream Provider interface defining the lifecycle of media capture.
 * @interface
 */
export class StreamProvider {
  /**
   * Starts the screen share capture.
   * @returns {Promise<MediaStream>} Resolves to the captured MediaStream.
   * @abstract
   */
  async startStream() {
    throw new Error("startStream must be implemented by a concrete class.");
  }

  /**
   * Stops the screen share capture and cleans up media tracks.
   * @returns {Promise<void>}
   * @abstract
   */
  async stopStream() {
    throw new Error("stopStream must be implemented by a concrete class.");
  }

  /**
   * Gets whether the stream provider is currently capturing.
   * @type {boolean}
   * @readonly
   * @abstract
   */
  get isActive() {
    throw new Error("isActive must be implemented by a concrete class.");
  }
}
