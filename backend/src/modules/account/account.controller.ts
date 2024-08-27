import { Request, Response, NextFunction } from 'express';
import * as accountService from './account.service';
import { CustomError } from '../../shared/utils/customError';
import { isAdmin } from '../../shared/utils/userUtils';

export const createAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string })?.id; //req.user?.id;
    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }
    const accountData = { ...req.body, userId };
    const account = await accountService.createAccount(accountData);
    res.status(201).json({ message: 'Account created successfully', account });
  } catch (error) {
    next(error);
  }
};

export const getAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as {id: string})?.id;
    const adminStatus = await isAdmin(userId);
    const { accountId } = req.params;
    const account = await accountService.getAccountById(accountId);
    if ((account && account.userId.toString() == userId) || adminStatus){
        res.json({ account });
    }
    else {
        throw new CustomError('Account not found', 404);
    }
  } catch (error) {
    next(error);
  }
};

export const getUserAccounts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string })?.id; //req.user?.id;
    if (!userId) {
      throw new CustomError('User not authenticated', 401);
    }
    const accounts = await accountService.getAccountsByUserId(userId);
    res.json({ accounts });
  } catch (error) {
    next(error);
  }
};

export const updateBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req.user as { id: string })?.id; //req.user?.id;
    const adminStatus = await isAdmin(userId);
    const { accountId } = req.params;
    const { amount } = req.body;
    const account = await accountService.getAccountById(accountId);
    if (account && account.userId.toString() == userId || adminStatus){
        const updatedAccount = await accountService.updateAccountBalance(accountId, amount);
        res.json({ message: 'Account balance updated successfully', account: updatedAccount });
    }
    else {
        throw new CustomError('Account not found', 404);
    }
  } catch (error) {
    next(error);
  }
};

export const deactivateAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accountId } = req.params;
    const deactivatedAccount = await accountService.deactivateAccount(accountId);
    res.json({ message: 'Account deactivated successfully', account: deactivatedAccount });
  } catch (error) {
    next(error);
  }
};