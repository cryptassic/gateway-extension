

export class ProviderNotInitializedError extends Error {
    innerError?: Error | unknown;   
  
    constructor(msg?: string, innerError?: Error | unknown) {
      super(msg);
      this.name = 'ProviderNotInitializedError';
      this.innerError = innerError;

      Object.setPrototypeOf(this, ProviderNotInitializedError.prototype);
    }
}
