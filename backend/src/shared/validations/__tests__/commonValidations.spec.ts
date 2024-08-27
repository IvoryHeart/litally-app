import { Request, Response, NextFunction } from 'express';
import { ValidationChain, validationResult } from 'express-validator';
import { emailValidation, passwordValidation, stringValidation, numberValidation } from '../commonValidations';

const runValidation = async (validationChain: ValidationChain, body: any) => {
  const req = {
    body,
  } as Request;
  const res = {} as Response;
  const next = jest.fn() as NextFunction;

  await validationChain.run(req);
  
  return validationResult(req);
};

describe('Common Validations', () => {
  describe('emailValidation', () => {
    it('should pass for valid email', async () => {
      const result = await runValidation(emailValidation, { email: 'test@example.com' });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail for invalid email', async () => {
      const result = await runValidation(emailValidation, { email: 'invalid-email' });
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('Please enter a valid email address');
    });
  });

  describe('passwordValidation', () => {
    it('should pass for valid password', async () => {
      const result = await runValidation(passwordValidation, { password: 'validpassword' });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail for short password', async () => {
      const result = await runValidation(passwordValidation, { password: 'short' });
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('Password must be at least 6 characters long');
    });
  });

  describe('stringValidation', () => {
    it('should pass for valid string', async () => {
      const result = await runValidation(stringValidation('name'), { name: 'John Doe' });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail for empty string', async () => {
      const result = await runValidation(stringValidation('name'), { name: '' });
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('name is required');
    });

    it('should fail for non-string value', async () => {
      const result = await runValidation(stringValidation('name'), { name: 123 });
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('name must be a string');
    });
  });

  describe('numberValidation', () => {
    it('should pass for valid number', async () => {
      const result = await runValidation(numberValidation('age'), { age: '25' });
      expect(result.isEmpty()).toBe(true);
    });

    it('should fail for empty value', async () => {
      const result = await runValidation(numberValidation('age'), { age: '' });
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('age is required');
    });

    it('should fail for non-numeric value', async () => {
      const result = await runValidation(numberValidation('age'), { age: 'twenty-five' });
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe('age must be a number');
    });
  });
});