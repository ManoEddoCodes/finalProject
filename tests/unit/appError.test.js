const AppError = require('../../utils/appError.js');

describe('AppError', () => {
  it('sets message and statusCode correctly (failure/4xx case)', () => {
    const err = new AppError('Not found', 404);
    expect(err.message).toBe('Not found');
    expect(err.statusCode).toBe(404);
    expect(err.status).toBe('fail');
    expect(err.isOperational).toBe(true);
  });

  it('marks 5xx codes with status "error" (success path for a 500)', () => {
    const err = new AppError('Server exploded', 500);
    expect(err.statusCode).toBe(500);
    expect(err.status).toBe('error');
  });

  it('defaults to statusCode 500 when none is provided', () => {
    const err = new AppError('Unknown');
    expect(err.statusCode).toBe(500);
  });

  it('is an instance of Error', () => {
    const err = new AppError('Oops', 400);
    expect(err).toBeInstanceOf(Error);
  });
});