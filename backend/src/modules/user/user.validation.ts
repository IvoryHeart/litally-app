import { body } from 'express-validator';
import { emailValidation, passwordValidation, stringValidation } from '../../shared/validations/commonValidations';

export const validateRegistration = [
  emailValidation,
  passwordValidation,
  stringValidation('firstName'),
  stringValidation('lastName'),
  body('userType').optional().isIn(['CUSTOMER']).withMessage('Invalid user type'), //Only customers are allowed to register, not admins
];

export const validateLogin = [
  emailValidation,
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateProfileUpdate = [
  stringValidation('firstName').optional(),
  stringValidation('lastName').optional(),
];

export const validateUserTypeUpdate = [
  body('userType').isIn(['CUSTOMER', 'ADMIN']).withMessage('Invalid user type'),
];