import mongoose from 'mongoose';
import * as accountService from '../account.service';
import Account from '../account.model';
import { CustomError } from '../../../shared/utils/customError';

jest.mock('../account.model');

describe('Account Service', () => {
  const mockAccount = {
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(),
    accountType: 'savings',
    accountName: 'Test Account',
    currency: 'USD',
    balance: 1000,
    isActive: true,
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('should create an account successfully', async () => {
      (Account as jest.MockedClass<typeof Account>).mockImplementation(() => mockAccount as any);

      const result = await accountService.createAccount(mockAccount);

      expect(result).toEqual(mockAccount);
      expect(mockAccount.save).toHaveBeenCalled();
    });
  });

  describe('getAccountById', () => {
    it('should return an account when found', async () => {
      (Account.findById as jest.Mock).mockResolvedValue(mockAccount);

      const result = await accountService.getAccountById(mockAccount._id.toString());

      expect(result).toEqual(mockAccount);
      expect(Account.findById).toHaveBeenCalledWith(mockAccount._id.toString());
    });

    it('should throw an error when account is not found', async () => {
      (Account.findById as jest.Mock).mockResolvedValue(null);

      await expect(accountService.getAccountById('nonexistentid')).rejects.toThrow(CustomError);
    });
  });

  describe('getAccountsByUserId', () => {
    it('should return accounts for a user', async () => {
      const mockAccounts = [mockAccount, { ...mockAccount, _id: new mongoose.Types.ObjectId() }];
      (Account.find as jest.Mock).mockResolvedValue(mockAccounts);

      const result = await accountService.getAccountsByUserId(mockAccount.userId.toString());

      expect(result).toEqual(mockAccounts);
      expect(Account.find).toHaveBeenCalledWith({ userId: mockAccount.userId.toString() });
    });
  });

  describe('updateAccountBalance', () => {
    it('should update account balance successfully', async () => {
        const initialBalance = 1000;
        const amountToAdd = 500;
        const mockAccount = {
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        accountType: 'savings',
        accountName: 'Test Account',
        currency: 'USD',
        balance: initialBalance,
        isActive: true,
        save: jest.fn(),
        updatedAt: new Date('2024-08-25T23:00:00.000Z'), // Set an initial date
        };

        (Account.findById as jest.Mock).mockResolvedValue(mockAccount);
        
        const result = await accountService.updateAccountBalance(mockAccount._id.toString(), amountToAdd);

        expect(result.balance).toBe(initialBalance + amountToAdd);
        expect(result.updatedAt).not.toEqual(new Date('2024-08-25T23:00:00.000Z')); // Check that updatedAt has changed
        expect(mockAccount.save).toHaveBeenCalled();
    });

    it('should subtract from account balance when given a negative amount', async () => {
        const initialBalance = 1000;
        const amountToSubtract = -300;
        const mockAccount = {
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(),
        accountType: 'savings',
        accountName: 'Test Account',
        currency: 'USD',
        balance: initialBalance,
        isActive: true,
        save: jest.fn(),
        updatedAt: new Date('2024-08-25T23:00:00.000Z'), // Set an initial date
        };

        (Account.findById as jest.Mock).mockResolvedValue(mockAccount);
        
        const result = await accountService.updateAccountBalance(mockAccount._id.toString(), amountToSubtract);

        expect(result.balance).toBe(initialBalance + amountToSubtract); // 1000 - 300 = 700
        expect(result.updatedAt).not.toEqual(new Date('2024-08-25T23:00:00.000Z')); // Check that updatedAt has changed
        expect(mockAccount.save).toHaveBeenCalled();
    });

    it('should throw an error when account is not found', async () => {
        (Account.findById as jest.Mock).mockResolvedValue(null);

        await expect(accountService.updateAccountBalance('nonexistentid', 500)).rejects.toThrow(CustomError);
    });
  });

  describe('deactivateAccount', () => {
    it('should deactivate an account successfully', async () => {
      const deactivatedAccount = { ...mockAccount, isActive: false };
      (Account.findByIdAndUpdate as jest.Mock).mockResolvedValue(deactivatedAccount);

      const result = await accountService.deactivateAccount(mockAccount._id.toString());

      expect(result).toEqual(deactivatedAccount);
      expect(Account.findByIdAndUpdate).toHaveBeenCalledWith(
        mockAccount._id.toString(),
        { isActive: false, updatedAt: expect.any(Date) },
        { new: true }
      );
    });

    it('should throw an error when account is not found', async () => {
      (Account.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(accountService.deactivateAccount('nonexistentid')).rejects.toThrow(CustomError);
    });
  });
});