import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../adminAuth';
import { CustomError } from '../../utils/customError';
import * as userUtils from '../../utils/userUtils';

jest.mock('../../utils/userUtils');

describe('Admin Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should throw an error if user is not authenticated', async () => {
    mockRequest = {
      user: undefined,
    };

    await adminAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(CustomError));
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User not authenticated',
        statusCode: 401,
      })
    );
  });

  it('should throw an error if user is not an admin', async () => {
    mockRequest = {
      user: { id: 'user123' },
    };

    (userUtils.isAdmin as jest.Mock).mockResolvedValue(false);

    await adminAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(CustomError));
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Admin access required',
        statusCode: 403,
      })
    );
  });

  it('should call next() if user is an admin', async () => {
    mockRequest = {
      user: { id: 'admin123' },
    };

    (userUtils.isAdmin as jest.Mock).mockResolvedValue(true);

    await adminAuth(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith();
  });
});