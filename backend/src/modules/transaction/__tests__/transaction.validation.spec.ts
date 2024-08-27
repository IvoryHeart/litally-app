import { validationResult } from 'express-validator';
import { validateTransactionCreation, validateTransactionStatusUpdate } from '../transaction.validation';

const mockRequest = (body: any) => ({
  body,
});

const getErrorField = (error: any): string => {
  return error.path || error.param || error.field || Object.keys(error)[0] || 'unknown';
};

describe('Transaction Validations', () => {
  describe('validateTransactionCreation', () => {
    it('should pass for valid transaction creation data', async () => {
      const req = mockRequest({
        accountId: '507f1f77bcf86cd799439011',
        type: 'CREDIT',
        amount: 100,
        currency: 'USD',
        description: 'Test transaction',
        subType: 'DEPOSIT',
      });

      await Promise.all(validateTransactionCreation.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail for invalid accountId', async () => {
      const req = mockRequest({
        accountId: 'invalid',
        type: 'CREDIT',
        amount: 100,
        currency: 'USD',
        description: 'Test transaction',
      });

      await Promise.all(validateTransactionCreation.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      expect(getErrorField(errors.array()[0])).toBe('accountId');
    });

    it('should fail for invalid type', async () => {
      const req = mockRequest({
        accountId: '507f1f77bcf86cd799439011',
        type: 'INVALID',
        amount: 100,
        currency: 'USD',
        description: 'Test transaction',
      });

      await Promise.all(validateTransactionCreation.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      expect(getErrorField(errors.array()[0])).toBe('type');
    });

    it('should fail for invalid amount', async () => {
      const req = mockRequest({
        accountId: '507f1f77bcf86cd799439011',
        type: 'CREDIT',
        amount: 'invalid',
        currency: 'USD',
        description: 'Test transaction',
      });

      await Promise.all(validateTransactionCreation.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      expect(getErrorField(errors.array()[0])).toBe('amount');
    });

    it('should fail for missing required fields', async () => {
      const req = mockRequest({});

      await Promise.all(validateTransactionCreation.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      expect(errors.array().length).toBeGreaterThan(1);
    });
  });

  describe('validateTransactionStatusUpdate', () => {
    it('should pass for valid status update', async () => {
      const req = mockRequest({
        status: 'COMPLETED',
      });

      await Promise.all(validateTransactionStatusUpdate.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail for invalid status', async () => {
      const req = mockRequest({
        status: 'INVALID',
      });

      await Promise.all(validateTransactionStatusUpdate.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      expect(getErrorField(errors.array()[0])).toBe('status');
    });

    it('should fail for missing status', async () => {
      const req = mockRequest({});

      await Promise.all(validateTransactionStatusUpdate.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      expect(getErrorField(errors.array()[0])).toBe('status');
    });
  });
});