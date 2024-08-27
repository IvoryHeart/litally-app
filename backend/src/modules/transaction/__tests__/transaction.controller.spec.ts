import { Request, Response } from 'express';
import * as transactionController from '../transaction.controller';
import * as transactionService from '../transaction.service';
import { CustomError } from '../../../shared/utils/customError';

jest.mock('../transaction.service');

describe('Transaction Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      user: { id: 'testUserId' },
    };
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe('createTransaction', () => {
    it('should create a transaction successfully', async () => {
      const transactionData = {
        accountId: 'testAccountId',
        type: 'CREDIT',
        amount: 100,
        currency: 'USD',
        description: 'Test transaction',
      };
      mockRequest.body = transactionData;
      
      const createdTransaction = { ...transactionData, _id: 'newTransactionId', status: 'COMPLETED' };
      (transactionService.createTransaction as jest.Mock).mockResolvedValue(createdTransaction);

      await transactionController.createTransaction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(transactionService.createTransaction).toHaveBeenCalledWith(transactionData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Transaction created and completed successfully',
        transaction: createdTransaction,
      });
    });

    it('should handle failed transaction creation', async () => {
      const transactionData = {
        accountId: 'testAccountId',
        type: 'CREDIT',
        amount: 100,
        currency: 'USD',
        description: 'Test transaction',
      };
      mockRequest.body = transactionData;
      
      const failedTransaction = { ...transactionData, _id: 'newTransactionId', status: 'FAILED' };
      (transactionService.createTransaction as jest.Mock).mockResolvedValue(failedTransaction);

      await transactionController.createTransaction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(transactionService.createTransaction).toHaveBeenCalledWith(transactionData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Transaction failed successfully',
        transaction: failedTransaction,
      });
    });
  });

  describe('getTransaction', () => {
    it('should get transaction details successfully', async () => {
      mockRequest.params = { transactionId: 'testTransactionId' };
      const transaction = { _id: 'testTransactionId', amount: 100, currency: 'USD' };
      (transactionService.getTransactionDetails as jest.Mock).mockResolvedValue(transaction);

      await transactionController.getTransaction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(transactionService.getTransactionDetails).toHaveBeenCalledWith('testTransactionId', 'testUserId');
      expect(mockResponse.json).toHaveBeenCalledWith({ transaction });
    });

    it('should handle unauthenticated user', async () => {
      mockRequest.user = undefined;

      await transactionController.getTransaction(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
    });
  });

  describe('getAccountTransactions', () => {
    it('should get account transactions successfully', async () => {
      mockRequest.params = { accountId: 'testAccountId' };
      const transactions = [{ _id: 'transaction1' }, { _id: 'transaction2' }];
      (transactionService.getTransactionsByAccountId as jest.Mock).mockResolvedValue(transactions);

      await transactionController.getAccountTransactions(mockRequest as Request, mockResponse as Response, mockNext);

      expect(transactionService.getTransactionsByAccountId).toHaveBeenCalledWith('testAccountId');
      expect(mockResponse.json).toHaveBeenCalledWith({ transactions });
    });
  });

  describe('updateTransactionStatus', () => {
    it('should update transaction status successfully', async () => {
      mockRequest.params = { transactionId: 'testTransactionId' };
      mockRequest.body = { status: 'COMPLETED' };
      const updatedTransaction = { _id: 'testTransactionId', status: 'COMPLETED' };
      (transactionService.updateTransactionStatus as jest.Mock).mockResolvedValue(updatedTransaction);

      await transactionController.updateTransactionStatus(mockRequest as Request, mockResponse as Response, mockNext);

      expect(transactionService.updateTransactionStatus).toHaveBeenCalledWith('testTransactionId', 'COMPLETED');
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Transaction status updated to COMPLETED successfully',
        transaction: updatedTransaction,
      });
    });

    it('should handle invalid status', async () => {
      mockRequest.params = { transactionId: 'testTransactionId' };
      mockRequest.body = { status: 'INVALID' };

      await transactionController.updateTransactionStatus(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(CustomError));
    });
  });
});