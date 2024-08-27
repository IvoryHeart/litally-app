import mongoose from 'mongoose';
import * as transactionService from '../transaction.service';
import Transaction, { ITransaction } from '../transaction.model';
import * as accountService from '../../account/account.service';
import * as paymentGateway from '../paymentGateway';
import * as userUtils from '../../../shared/utils/userUtils';
import { CustomError } from '../../../shared/utils/customError';

jest.mock('../transaction.model');
jest.mock('../../account/account.service');
jest.mock('../paymentGateway');
jest.mock('../../../shared/utils/userUtils');

describe('Transaction Service', () => {
  const mockTransaction: Partial<ITransaction> = {
    _id: new mongoose.Types.ObjectId(),
    accountId: new mongoose.Types.ObjectId(),
    type: 'CREDIT',
    amount: 100,
    currency: 'USD',
    description: 'Test transaction',
    status: 'PENDING',
    save: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create a CREDIT transaction successfully', async () => {
      (Transaction as jest.MockedClass<typeof Transaction>).mockImplementation(() => mockTransaction as any);
      (paymentGateway.processPayment as jest.Mock).mockResolvedValue({ success: true });
      (accountService.updateAccountBalance as jest.Mock).mockResolvedValue({});

      const result = await transactionService.createTransaction(mockTransaction);

      expect(result).toEqual({ ...mockTransaction, status: 'COMPLETED' });
      expect(accountService.updateAccountBalance).toHaveBeenCalledWith(mockTransaction.accountId!.toString(), mockTransaction.amount);
      expect(mockTransaction.save).toHaveBeenCalled();
    });

    it('should create a DEBIT transaction successfully', async () => {
      const debitTransaction: Partial<ITransaction> = {
        ...mockTransaction,
        type: 'DEBIT',
        amount: 100, // Ensure amount is explicitly set
      };
      (Transaction as jest.MockedClass<typeof Transaction>).mockImplementation(() => debitTransaction as any);
      (paymentGateway.processPayment as jest.Mock).mockResolvedValue({ success: true });
      (accountService.updateAccountBalance as jest.Mock).mockResolvedValue({});

      const result = await transactionService.createTransaction(debitTransaction);

      expect(result).toEqual({ ...debitTransaction, status: 'COMPLETED' });
      expect(accountService.updateAccountBalance).toHaveBeenCalledWith(
        debitTransaction.accountId!.toString(),
        -debitTransaction.amount! // Use non-null assertion as it's set explicitly above
      );
      expect(debitTransaction.save).toHaveBeenCalled();
    });

    it('should handle failed payment', async () => {
      (Transaction as jest.MockedClass<typeof Transaction>).mockImplementation(() => mockTransaction as any);
      (paymentGateway.processPayment as jest.Mock).mockResolvedValue({ success: false, status: 'FAILED' });

      const result = await transactionService.createTransaction(mockTransaction);

      expect(result).toEqual({ ...mockTransaction, status: 'FAILED' });
      expect(accountService.updateAccountBalance).not.toHaveBeenCalled();
      expect(mockTransaction.save).toHaveBeenCalled();
    });
  });

  describe('getTransactionDetails', () => {
    it('should return transaction details for admin user', async () => {
      (Transaction.findById as jest.Mock).mockResolvedValue(mockTransaction);
      (userUtils.isAdmin as jest.Mock).mockResolvedValue(true);

      const result = await transactionService.getTransactionDetails(mockTransaction._id!.toString(), 'adminUserId');

      expect(result).toEqual(mockTransaction);
    });

    it('should return transaction details for account owner', async () => {
      (Transaction.findById as jest.Mock).mockResolvedValue(mockTransaction);
      (userUtils.isAdmin as jest.Mock).mockResolvedValue(false);
      (accountService.getAccountById as jest.Mock).mockResolvedValue({ userId: 'ownerUserId' });

      const result = await transactionService.getTransactionDetails(mockTransaction._id!.toString(), 'ownerUserId');

      expect(result).toEqual(mockTransaction);
    });

    it('should throw error for unauthorized access', async () => {
      (Transaction.findById as jest.Mock).mockResolvedValue(mockTransaction);
      (userUtils.isAdmin as jest.Mock).mockResolvedValue(false);
      (accountService.getAccountById as jest.Mock).mockResolvedValue({ userId: 'differentUserId' });

      await expect(transactionService.getTransactionDetails(mockTransaction._id!.toString(), 'unauthorizedUserId'))
        .rejects.toThrow(CustomError);
    });
  });

  describe('getTransactionsByAccountId', () => {
    it('should return transactions for an account', async () => {
      const mockTransactions = [mockTransaction, { ...mockTransaction, _id: new mongoose.Types.ObjectId() }];
      (Transaction.find as jest.Mock).mockResolvedValue(mockTransactions);

      const result = await transactionService.getTransactionsByAccountId(mockTransaction.accountId!.toString());

      expect(result).toEqual(mockTransactions);
      expect(Transaction.find).toHaveBeenCalledWith({ accountId: mockTransaction.accountId!.toString() });
    });
  });

  describe('updateTransactionStatus', () => {
    it('should update transaction status to COMPLETED', async () => {
      const pendingTransaction = { ...mockTransaction, status: 'PENDING' as const, save: jest.fn() };
      (Transaction.findById as jest.Mock).mockResolvedValue(pendingTransaction);
      (accountService.updateAccountBalance as jest.Mock).mockResolvedValue({});

      const result = await transactionService.updateTransactionStatus(pendingTransaction._id!.toString(), 'COMPLETED');

      expect(result.status).toBe('COMPLETED');
      expect(accountService.updateAccountBalance).toHaveBeenCalledWith(pendingTransaction.accountId!.toString(), pendingTransaction.amount);
      expect(pendingTransaction.save).toHaveBeenCalled();
    });

    it('should update transaction status to FAILED', async () => {
      const pendingTransaction = { ...mockTransaction, status: 'PENDING' as const, save: jest.fn() };
      (Transaction.findById as jest.Mock).mockResolvedValue(pendingTransaction);

      const result = await transactionService.updateTransactionStatus(pendingTransaction._id!.toString(), 'FAILED');

      expect(result.status).toBe('FAILED');
      expect(accountService.updateAccountBalance).not.toHaveBeenCalled();
      expect(pendingTransaction.save).toHaveBeenCalled();
    });

    it('should throw error for non-pending transaction', async () => {
      const completedTransaction = { ...mockTransaction, status: 'COMPLETED' as const };
      (Transaction.findById as jest.Mock).mockResolvedValue(completedTransaction);

      await expect(transactionService.updateTransactionStatus(completedTransaction._id!.toString(), 'FAILED'))
        .rejects.toThrow(CustomError);
    });
  });
});