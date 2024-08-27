import Transaction, { ITransaction } from './transaction.model';
import { CustomError } from '../../shared/utils/customError';
import * as accountService from '../account/account.service';
import { processPayment } from './paymentGateway';
import { isAdmin } from '../../shared/utils/userUtils';
import { IUser } from '../user/user.model';
import mongoose from 'mongoose';


export const createTransaction = async (transactionData: Partial<ITransaction>): Promise<ITransaction> => {
  const transaction = new Transaction(transactionData);
  // Process payment through the mock payment gateway
  const paymentResult = await processPayment(transaction.amount, transaction.currency);

  if (paymentResult.success) {
    transaction.status = 'COMPLETED';
    
    // Update account balance
    const amount = transaction.type === 'CREDIT' ? transaction.amount : -transaction.amount;
    await accountService.updateAccountBalance(transaction.accountId.toString(), amount);
  } else {
    transaction.status = paymentResult.status? paymentResult.status: 'FAILED';
  }

  await transaction.save();
  return transaction;

};

//Unused
/*
export const getTransactionById = async (transactionId: string): Promise<ITransaction> => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    throw new CustomError('Transaction not found', 404);
  }
  return transaction;
};
*/

export const getTransactionDetails = async (transactionId: string, userId: string): Promise<ITransaction> => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    throw new CustomError('Transaction not found', 404);
  }

  // If the user is not an admin, check if the transaction belongs to their account
  const adminStatus = await isAdmin(userId);
  if (!adminStatus) {
    const account = await accountService.getAccountById(transaction.accountId.toString());
    if (account.userId.toString() !== userId) {
      throw new CustomError('Access denied', 403);
    }
  }

  return transaction;
};

export const getTransactionsByAccountId = async (accountId: string): Promise<ITransaction[]> => {
  return Transaction.find({ accountId });
};

export const updateTransactionStatus = async (transactionId: string, status: 'COMPLETED' | 'FAILED'): Promise<ITransaction> => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    throw new CustomError('Transaction not found', 404);
  }

  if (transaction.status !== 'PENDING') {
    throw new CustomError('Cannot update status of non-pending transaction', 400);
  }

  transaction.status = status;
  transaction.updatedAt = new Date();

  if (status === 'COMPLETED') {
    // Update account balance
    const amount = transaction.type === 'CREDIT' ? transaction.amount : -transaction.amount;
    await accountService.updateAccountBalance(transaction.accountId.toString(), amount);
  }

  await transaction.save();
  return transaction;
};