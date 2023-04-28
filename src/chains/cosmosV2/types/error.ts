

export class ProviderNotInitializedError extends Error {
    constructor(msg?: string) {
      super(msg);
      this.name = 'ProviderNotInitializedError';
    }
}