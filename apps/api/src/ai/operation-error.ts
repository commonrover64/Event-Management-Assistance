// A problem with a single AI operation: it is reported back and the rest of the turn continues
export class OperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OperationError';
  }
}
