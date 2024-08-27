import { body } from 'express-validator';

export const emailValidation = body('email')
  .isEmail()
  .withMessage('Please enter a valid email address');

export const passwordValidation = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long');

export const stringValidation = (field: string) => 
  body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .isString()
    .withMessage(`${field} must be a string`);

export const numberValidation = (field: string) =>
  body(field)
    .notEmpty()
    .withMessage(`${field} is required`)
    .isNumeric()
    .withMessage(`${field} must be a number`);