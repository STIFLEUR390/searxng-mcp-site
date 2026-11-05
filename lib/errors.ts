/** An upstream (SearXNG) failure with a message and hint safe to show in the UI. */
export class UpstreamError extends Error {
  override name = "UpstreamError";

  constructor(
    message: string,
    readonly status: number,
    readonly hint?: string,
  ) {
    super(message);
  }
}
