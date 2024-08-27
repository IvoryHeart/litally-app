import { validationResult } from 'express-validator';
import { validateRegistration, validateLogin, validateProfileUpdate, validateUserTypeUpdate } from '../user.validation';

const mockRequest = (body: any) => ({
  body,
});

const getErrorField = (error: any): string => {
  // Check various possible properties where the field name might be stored
  return error.path || error.param || error.field || Object.keys(error)[0] || 'unknown';
};

describe('User Validations', () => {
  describe('validateRegistration', () => {
    it('should pass for valid registration data', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

      await Promise.all(validateRegistration.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail for invalid email', async () => {
      const req = mockRequest({
        email: 'invalidemail',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      });

      await Promise.all(validateRegistration.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      if (errors.array().length > 0) {
        console.log('Error object:', JSON.stringify(errors.array()[0], null, 2));
      }
      expect(getErrorField(errors.array()[0])).toBe('email');
    });

    it('should fail for weak password', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'weak',
        firstName: 'Test',
        lastName: 'User',
      });

      await Promise.all(validateRegistration.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      if (errors.array().length > 0) {
        console.log('Error object:', JSON.stringify(errors.array()[0], null, 2));
      }
      expect(getErrorField(errors.array()[0])).toBe('password');
    });
  });

  describe('validateLogin', () => {
    it('should pass for valid login data', async () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'Password123!',
      });

      await Promise.all(validateLogin.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail for missing password', async () => {
      const req = mockRequest({
        email: 'test@example.com',
      });

      await Promise.all(validateLogin.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      if (errors.array().length > 0) {
        console.log('Error object:', JSON.stringify(errors.array()[0], null, 2));
      }
      expect(getErrorField(errors.array()[0])).toBe('password');
    });
  });

  describe('validateProfileUpdate', () => {
    it('should pass for valid profile update data', async () => {
      const req = mockRequest({
        firstName: 'Updated',
        lastName: 'Name',
      });

      await Promise.all(validateProfileUpdate.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail for invalid firstName', async () => {
      const req = mockRequest({
        firstName: '',
        lastName: 'Name',
      });

      await Promise.all(validateProfileUpdate.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      if (errors.array().length > 0) {
        console.log('Error object:', JSON.stringify(errors.array()[0], null, 2));
      }
      expect(getErrorField(errors.array()[0])).toBe('firstName');
    });
  });

  describe('validateUserTypeUpdate', () => {
    it('should pass for valid user type', async () => {
      const req = mockRequest({
        userType: 'ADMIN',
      });

      await Promise.all(validateUserTypeUpdate.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
    });

    it('should fail for invalid user type', async () => {
      const req = mockRequest({
        userType: 'INVALID_TYPE',
      });

      await Promise.all(validateUserTypeUpdate.map(validation => validation.run(req)));
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      if (errors.array().length > 0) {
        console.log('Error object:', JSON.stringify(errors.array()[0], null, 2));
      }
      expect(getErrorField(errors.array()[0])).toBe('userType');
    });
  });
});