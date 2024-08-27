import mongoose from 'mongoose';
import Transaction, { ITransaction } from '../transaction.model';

describe('Transaction Model', () => {
  it('should create a transaction with valid fields', async () => {
    const transactionData = {
      accountId: new mongoose.Types.ObjectId(),
      type: 'CREDIT',
      amount: 100,
      currency: 'USD',
      description: 'Test transaction',
      subType: 'DEPOSIT',
    };

    const transaction = new Transaction(transactionData);
    await transaction.validate();

    expect(transaction.accountId).toEqual(transactionData.accountId);
    expect(transaction.type).toBe(transactionData.type);
    expect(transaction.amount).toBe(transactionData.amount);
    expect(transaction.currency).toBe(transactionData.currency);
    expect(transaction.description).toBe(transactionData.description);
    expect(transaction.subType).toBe(transactionData.subType);
    expect(transaction.status).toBe('PENDING');
    expect(transaction.createdAt).toBeDefined();
    expect(transaction.updatedAt).toBeDefined();
  });

  it('should fail validation if required fields are missing', async () => {
    const transaction = new Transaction({});
    await expect(transaction.validate()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail validation for invalid type', async () => {
    const transaction = new Transaction({
      accountId: new mongoose.Types.ObjectId(),
      type: 'INVALID',
      amount: 100,
      currency: 'USD',
      description: 'Test transaction',
    });
    await expect(transaction.validate()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should fail validation for invalid status', async () => {
    const transaction = new Transaction({
      accountId: new mongoose.Types.ObjectId(),
      type: 'CREDIT',
      amount: 100,
      currency: 'USD',
      description: 'Test transaction',
      status: 'INVALID',
    });
    await expect(transaction.validate()).rejects.toThrow(mongoose.Error.ValidationError);
  });
});