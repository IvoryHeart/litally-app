import { CustomError } from '../customError';

describe('CustomError', () => {
  it('should create a CustomError instance with the correct properties', () => {
    const message = 'Test error message';
    const statusCode = 400;
    const error = new CustomError(message, statusCode);

    expect(error).toBeInstanceOf(CustomError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
  });

  it('should capture the stack trace', () => {
    const error = new CustomError('Test error', 500);
    expect(error.stack).toBeDefined();
  });
});