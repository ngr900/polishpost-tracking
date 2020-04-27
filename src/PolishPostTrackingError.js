class PolishPostTrackingError extends Error {
  constructor ( message ) {
    super ( message);
    this.name = 'PolishPostTrackingError';
  }
}

module.exports = PolishPostTrackingError;