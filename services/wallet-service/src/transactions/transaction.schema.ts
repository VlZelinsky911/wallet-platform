import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Currency } from '../wallets/wallet.schema';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
  TOP_UP = 'top_up',
  TRANSFER = 'transfer',
  WITHDRAWAL = 'withdrawal',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true, unique: true })
  transactionId: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Wallet' })
  fromWalletId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Wallet', default: null })
  toWalletId?: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, enum: Currency })
  currency: Currency;

  @Prop({ required: true, enum: TransactionType })
  type: TransactionType;

  @Prop({
    required: true,
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Prop({ default: null })
  description?: string;

  @Prop({ default: null })
  failureReason?: string;

  @Prop({ default: null })
  processedAt?: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
