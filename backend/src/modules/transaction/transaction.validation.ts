import { body } from 'express-validator';
import { stringValidation, numberValidation } from '../../shared/validations/commonValidations';

export const validateTransactionCreation = [
  body('accountId').isMongoId().withMessage('Invalid account ID'),
  body('type').isIn(['CREDIT', 'DEBIT']).withMessage('Type must be either CREDIT or DEBIT'),
  numberValidation('amount'),
  stringValidation('currency'),
  stringValidation('description'),
  body('subType').optional().isString().withMessage('SubType must be a string'),
];

export const validateTransactionStatusUpdate = [
  body('status').isIn(['COMPLETED', 'FAILED']).withMessage('Status must be either COMPLETED or FAILED'),
];