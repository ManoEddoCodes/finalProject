const asyncHandler = require('../../utils/asyncHandler.js');

describe('asyncHandler', () => {
  it('calls the wrapped function with req, res, next (success case)', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();
    const fn = jest.fn().mockResolvedValue('ok');

    const wrapped = asyncHandler(fn);
    await wrapped(req, res, next);

    expect(fn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards a rejected promise to next() instead of throwing (failure case)', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();
    const error = new Error('boom');
    const fn = jest.fn().mockRejectedValue(error);

    const wrapped = asyncHandler(fn);
    await wrapped(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});