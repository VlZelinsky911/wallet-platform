import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { TransactionType, TransactionStatus } from './transaction.schema';
import { Currency } from '../wallets/wallet.schema';

registerEnumType(TransactionType, {
  name: 'TransactionType',
});

registerEnumType(TransactionStatus, {
  name: 'TransactionStatus',
});

@ObjectType()
export class Transaction {
  @Field(() => ID)
  id: string;

  @Field()
  transactionId: string;

  @Field()
  fromWalletId: string;

  @Field({ nullable: true })
  toWalletId?: string;

  @Field()
  amount: number;

  @Field(() => Currency)
  currency: Currency;

  @Field(() => TransactionType)
  type: TransactionType;

  @Field(() => TransactionStatus)
  status: TransactionStatus;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  failureReason?: string;

  @Field({ nullable: true })
  processedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
