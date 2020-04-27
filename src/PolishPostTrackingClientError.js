class PolishPostClientError extends Error {
  constructor ( message ) {
    super ( message);
    this.name = 'PolishPostClientError';
  }
}

module.exports = PolishPostClientError;