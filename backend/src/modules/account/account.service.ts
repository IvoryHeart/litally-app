import Account, { IAccount } from './account.model';
import { CustomError } from '../../shared/utils/customError';

export const createAccount = async (accountData: Partial<IAccount>): Promise<IAccount> => {
  const account = new Account(accountData);
  await account.save();
  return account;
};

export const getAccountById = async (accountId: string): Promise<IAccount> => {
  const account = await Account.findById(accountId);
  if (!account) {
    throw new CustomError('Account not found', 404);
  }
  return account;
};

export const getAccountsByUserId = async (userId: string): Promise<IAccount[]> => {
  return Account.find({ userId });
};

export const updateAccountBalance = async (accountId: string, amount: number): Promise<IAccount> => {
  const account = await Account.findById(accountId);
  if (!account) {
    throw new CustomError('Account not found', 404);
  }
  account.balance += amount;
  account.updatedAt = new Date();
  await account.save();
  return account;
};

export const deactivateAccount = async (accountId: string): Promise<IAccount> => {
  const account = await Account.findByIdAndUpdate(
    accountId,
    { isActive: false, updatedAt: new Date() },
    { new: true }
  );
  if (!account) {
    throw new CustomError('Account not found', 404);
  }
  return account;
};