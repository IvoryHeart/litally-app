import { body } from 'express-validator';
import { stringValidation, numberValidation } from '../../shared/validations/commonValidations';

export const validateAccountCreation = [
  stringValidation('accountType'),
  stringValidation('accountName'),
  stringValidation('currency'),
];

export const validateBalanceUpdate = [
  numberValidation('amount'),
];