// Thrown for expected, client-facing failures so the error handler can return the right HTTP status instead of a generic 500.
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
  }
}
