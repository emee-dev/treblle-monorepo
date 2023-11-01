export class TreblleRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = '[TREBLLE_REQUEST_ERROR]';
  }
}

export class TreblleRuntimeError extends Error {
  constructor(message: string, public errorStack?: unknown) {
    super(message);
    this.name = '[TREBLLE_RUNTIME_ERROR]';
  }
}
