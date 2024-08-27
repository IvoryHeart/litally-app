import { Request, Response, NextFunction } from 'express';
import * as transactionService from './transaction.service';
import { CustomError } from '../../shared/utils/customError';
import User, { IUser } from '../user/user.model';

export const createTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactionData = req.body;
    const transaction = await transactionService.createTransaction(transactionData);
    res.status(201).json({ 
        message: `Transaction ${transaction.status === 'COMPLETED' ? 'created and completed' : 'failed'} successfully`, 
      transaction 
    });
  } catch (error) {
    next(error);
  }
};

export const getTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionId } = req.params;
    const userId = (req.user as { id: string })?.id; //req.user?.id;
    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }

    const transaction = await transactionService.getTransactionDetails(transactionId, userId);
    res.json({ transaction });
  } catch (error) {
    next(error);
  }
};


export const getAccountTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountId } = req.params;
    const transactions = await transactionService.getTransactionsByAccountId(accountId);
    res.json({ transactions });
  } catch (error) {
    next(error);
  }
};

export const updateTransactionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionId } = req.params;
    const { status } = req.body;
    if (status !== 'COMPLETED' && status !== 'FAILED') {
      throw new CustomError('Invalid status', 400);
    }
    const updatedTransaction = await transactionService.updateTransactionStatus(transactionId, status);
    res.json({ 
        message: `Transaction status updated to ${status} successfully`, 
        transaction: updatedTransaction 
    });
  } catch (error) {
    next(error);
  }
};