import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  accountId: mongoose.Types.ObjectId;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  currency: string;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  subType: 'DEPOSIT' | 'PAYMENT';
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, enum: ['CREDIT', 'DEBIT'], required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  subType: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);