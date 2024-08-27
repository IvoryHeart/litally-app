import { Request, Response } from 'express';
import { errorHandler } from '../errorHandler';
import { CustomError } from '../../utils/customError';
import logger from '../../utils/logger';

jest.mock('../../utils/logger');

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should handle CustomError correctly', () => {
    const customError = new CustomError('Test error', 400);

    errorHandler(customError, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Test error' });
    expect(logger.error).toHaveBeenCalledWith(customError);
  });

  it('should handle generic Error as Internal Server Error', () => {
    const genericError = new Error('Generic error');

    errorHandler(genericError, mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    expect(logger.error).toHaveBeenCalledWith(genericError);
  });
});