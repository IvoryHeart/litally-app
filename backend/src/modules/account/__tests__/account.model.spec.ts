import mongoose from 'mongoose';
import Account, { IAccount } from '../account.model';

describe('Account Model', () => {
  it('should create an account with valid fields', async () => {
    const accountData = {
      userId: new mongoose.Types.ObjectId(),
      accountType: 'savings',
      accountName: 'My Savings',
      currency: 'USD',
      balance: 1000,
    };

    const account = new Account(accountData);
    await account.validate();

    expect(account.userId).toEqual(accountData.userId);
    expect(account.accountType).toBe(accountData.accountType);
    expect(account.accountName).toBe(accountData.accountName);
    expect(account.currency).toBe(accountData.currency);
    expect(account.balance).toBe(accountData.balance);
    expect(account.isActive).toBe(true);
    expect(account.createdAt).toBeDefined();
    expect(account.updatedAt).toBeDefined();
  });

  it('should fail validation if required fields are missing', async () => {
    const account = new Account({});
    await expect(account.validate()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should set default values correctly', async () => {
    const userId = new mongoose.Types.ObjectId();
    const account = new Account({
      userId,
      accountType: 'checking',
      accountName: 'My Checking',
      currency: 'EUR',
    });

    expect(account.balance).toBe(0);
    expect(account.isActive).toBe(true);
  });
});