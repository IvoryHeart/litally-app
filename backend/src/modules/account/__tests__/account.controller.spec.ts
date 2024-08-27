import { Request, Response } from 'express';
import * as accountController from '../account.controller';
import * as accountService from '../account.service';
import { CustomError } from '../../../shared/utils/customError';
import * as userUtils from '../../../shared/utils/userUtils';

jest.mock('../account.service');
jest.mock('../../../shared/utils/userUtils');

describe('Account Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      user: { id: 'testUserId' },
      params: {},
      body: {},
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('createAccount', () => {
    it('should create an account successfully', async () => {
      const accountData = { accountType: 'savings', accountName: 'My Savings', currency: 'USD' };
      mockRequest.body = accountData;
      
      const createdAccount = { ...accountData, _id: 'newAccountId', userId: 'testUserId' };
      (accountService.createAccount as jest.Mock).mockResolvedValue(createdAccount);

      await accountController.createAccount(mockRequest as Request, mockResponse as Response, mockNext);

      expect(accountService.createAccount).toHaveBeenCalledWith({ ...accountData, userId: 'testUserId' });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Account created successfully', account: createdAccount });
    });

    it('should handle unauthenticated user', async () => {
      mockRequest.user = undefined;

      await accountController.createAccount(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
    });
  });

  describe('getAccount', () => {
    it('should get account details for owner', async () => {
      mockRequest.params = { accountId: 'testAccountId' };
      const account = { _id: 'testAccountId', userId: 'testUserId', accountName: 'Test Account' };
      (accountService.getAccountById as jest.Mock).mockResolvedValue(account);
      (userUtils.isAdmin as jest.Mock).mockResolvedValue(false);

      await accountController.getAccount(mockRequest as Request, mockResponse as Response, mockNext);

      expect(accountService.getAccountById).toHaveBeenCalledWith('testAccountId');
      expect(mockResponse.json).toHaveBeenCalledWith({ account });
    });

    it('should get account details for admin', async () => {
      mockRequest.params = { accountId: 'testAccountId' };
      mockRequest.user = { id: 'adminUserId' };
      const account = { _id: 'testAccountId', userId: 'testUserId', accountName: 'Test Account' };
      (accountService.getAccountById as jest.Mock).mockResolvedValue(account);
      (userUtils.isAdmin as jest.Mock).mockResolvedValue(true);

      await accountController.getAccount(mockRequest as Request, mockResponse as Response, mockNext);

      expect(accountService.getAccountById).toHaveBeenCalledWith('testAccountId');
      expect(mockResponse.json).toHaveBeenCalledWith({ account });
    });

    it('should handle non-existent account', async () => {
      mockRequest.params = { accountId: 'nonExistentId' };
      (accountService.getAccountById as jest.Mock).mockResolvedValue(null);
      (userUtils.isAdmin as jest.Mock).mockResolvedValue(false);

      await accountController.getAccount(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
    });
  });

  describe('getUserAccounts', () => {
    it('should get user accounts successfully', async () => {
      const accounts = [{ _id: 'account1' }, { _id: 'account2' }];
      (accountService.getAccountsByUserId as jest.Mock).mockResolvedValue(accounts);

      await accountController.getUserAccounts(mockRequest as Request, mockResponse as Response, mockNext);

      expect(accountService.getAccountsByUserId).toHaveBeenCalledWith('testUserId');
      expect(mockResponse.json).toHaveBeenCalledWith({ accounts });
    });

    it('should handle unauthenticated user', async () => {
      mockRequest.user = undefined;

      await accountController.getUserAccounts(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
    });
  });

  describe('updateBalance', () => {
    it('should update balance successfully for account owner', async () => {
      mockRequest.params = { accountId: 'testAccountId' };
      mockRequest.body = { amount: 100 };
      const account = { _id: 'testAccountId', userId: 'testUserId', balance: 500 };
      const updatedAccount = { ...account, balance: 600 };
      (accountService.getAccountById as jest.Mock).mockResolvedValue(account);
      (accountService.updateAccountBalance as jest.Mock).mockResolvedValue(updatedAccount);
      (userUtils.isAdmin as jest.Mock).mockResolvedValue(false);

      await accountController.updateBalance(mockRequest as Request, mockResponse as Response, mockNext);

      expect(accountService.updateAccountBalance).toHaveBeenCalledWith('testAccountId', 100);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Account balance updated successfully', account: updatedAccount });
    });

    it('should update balance successfully for admin', async () => {
      mockRequest.params = { accountId: 'testAccountId' };
      mockRequest.body = { amount: 100 };
      mockRequest.user = { id: 'adminUserId' };
      const account = { _id: 'testAccountId', userId: 'testUserId', balance: 500 };
      const updatedAccount = { ...account, balance: 600 };
      (accountService.getAccountById as jest.Mock).mockResolvedValue(account);
      (accountService.updateAccountBalance as jest.Mock).mockResolvedValue(updatedAccount);
      (userUtils.isAdmin as jest.Mock).mockResolvedValue(true);

      await accountController.updateBalance(mockRequest as Request, mockResponse as Response, mockNext);

      expect(accountService.updateAccountBalance).toHaveBeenCalledWith('testAccountId', 100);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Account balance updated successfully', account: updatedAccount });
    });

    it('should handle non-existent account', async () => {
      mockRequest.params = { accountId: 'nonExistentId' };
      mockRequest.body = { amount: 100 };
      (accountService.getAccountById as jest.Mock).mockResolvedValue(null);
      (userUtils.isAdmin as jest.Mock).mockResolvedValue(false);

      await accountController.updateBalance(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
    });
  });

  describe('deactivateAccount', () => {
    it('should deactivate account successfully', async () => {
      mockRequest.params = { accountId: 'testAccountId' };
      const deactivatedAccount = { _id: 'testAccountId', isActive: false };
      (accountService.deactivateAccount as jest.Mock).mockResolvedValue(deactivatedAccount);

      await accountController.deactivateAccount(mockRequest as Request, mockResponse as Response, mockNext);

      expect(accountService.deactivateAccount).toHaveBeenCalledWith('testAccountId');
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Account deactivated successfully', account: deactivatedAccount });
    });

    it('should handle error when deactivating account', async () => {
      mockRequest.params = { accountId: 'testAccountId' };
      const error = new Error('Deactivation failed');
      (accountService.deactivateAccount as jest.Mock).mockRejectedValue(error);

      await accountController.deactivateAccount(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});