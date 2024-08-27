import { validationResult } from 'express-validator';
import { validateAccountCreation, validateBalanceUpdate } from '../account.validation';

const mockRequest = (body: any) => ({
  body,
});

const getErrorField = (error: any): string => {
  return error.path || error.param || error.field || Object.keys(error)[0] || 'unknown';
};

describe('Account Validations', () => {
  describe('validateAccountCreation', () => {
    it('should pass for valid account creation data', async () => {
      const req = mockRequest({
        accountType: 'savings',
        accountName: 'My Savings Account',
        currency: 'USD',
      });

      await Promise.all(validateAccountCreation.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail for missing accountType', async () => {
      const req = mockRequest({
        accountName: 'My Savings Account',
        currency: 'USD',
      });

      await Promise.all(validateAccountCreation.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      expect(getErrorField(errors.array()[0])).toBe('accountType');
    });

    it('should fail for missing accountName', async () => {
      const req = mockRequest({
        accountType: 'savings',
        currency: 'USD',
      });

      await Promise.all(validateAccountCreation.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      expect(getErrorField(errors.array()[0])).toBe('accountName');
    });

    it('should fail for missing currency', async () => {
      const req = mockRequest({
        accountType: 'savings',
        accountName: 'My Savings Account',
      });

      await Promise.all(validateAccountCreation.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      expect(getErrorField(errors.array()[0])).toBe('currency');
    });
  });

  describe('validateBalanceUpdate', () => {
    it('should pass for valid balance update data', async () => {
      const req = mockRequest({
        amount: 100,
      });

      await Promise.all(validateBalanceUpdate.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail for missing amount', async () => {
      const req = mockRequest({});

      await Promise.all(validateBalanceUpdate.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      expect(getErrorField(errors.array()[0])).toBe('amount');
    });

    it('should fail for non-numeric amount', async () => {
      const req = mockRequest({
        amount: 'not a number',
      });

      await Promise.all(validateBalanceUpdate.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      expect(getErrorField(errors.array()[0])).toBe('amount');
    });
  });
});