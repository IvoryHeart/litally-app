import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../auth';
import { CustomError } from '../../utils/customError';

jest.mock('jsonwebtoken');

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should throw an error if no authorization header is present', async () => {
    mockRequest = {
      headers: {},
    };

    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(CustomError));
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'No token provided',
        statusCode: 401,
      })
    );
  });

  it('should throw an error if the token is invalid', async () => {
    mockRequest = {
      headers: {
        authorization: 'Bearer invalidtoken',
      },
    };

    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(expect.any(CustomError));
    expect(nextFunction).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid token',
        statusCode: 401,
      })
    );
  });

  it('should set req.user and call next() if the token is valid', async () => {
    mockRequest = {
      headers: {
        authorization: 'Bearer validtoken',
      },
    };

    const mockDecodedToken = { id: 'user123' };
    (jwt.verify as jest.Mock).mockReturnValue(mockDecodedToken);

    authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.user).toEqual({ id: 'user123' });
    expect(nextFunction).toHaveBeenCalledWith();
  });
});