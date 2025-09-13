import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletDocument = Wallet & Document;

export enum WalletStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  FROZEN = 'frozen',
}

export enum Currency {
  USD = 'USD',
  EUR = 'EUR',
  UAH = 'UAH',
}

@Schema({ timestamps: true })
export class Wallet {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  walletNumber: string;

  @Prop({ required: true, default: 0, min: 0 })
  balance: number;

  @Prop({ required: true, enum: Currency, default: Currency.USD })
  currency: Currency;

  @Prop({ required: true, enum: WalletStatus, default: WalletStatus.ACTIVE })
  status: WalletStatus;

  @Prop({ default: null })
  blockedAt?: Date;

  @Prop({ default: null })
  blockedReason?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
