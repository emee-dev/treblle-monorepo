export class TreblleRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'TreblleRequestError';
  }
}

export class TreblleRuntimeError extends Error {
  constructor(message: string, public errorStack?: unknown) {
    super(message);
  }
}
