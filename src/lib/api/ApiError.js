/**
 * Frontend counterpart of your server-side AppError.
 * Thrown by the fetch helper whenever an API responds with a non-2xx status.
 *
 *   code    -> e.g. "DUPLICATE_DOCUMENT" (from error.code in the API response)
 *   status  -> HTTP status, e.g. 409
 *   details -> optional extra info sent by the server
 */
export class ApiError extends Error {
  constructor(message, status = 500, code = "UNKNOWN_ERROR", details = null) {
    super(message);

    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}