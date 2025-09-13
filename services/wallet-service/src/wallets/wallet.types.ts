import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { WalletStatus, Currency } from './wallet.schema';

registerEnumType(WalletStatus, {
  name: 'WalletStatus',
});

registerEnumType(Currency, {
  name: 'Currency',
});

@ObjectType()
export class Wallet {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  walletNumber: string;

  @Field()
  balance: number;

  @Field(() => Currency)
  currency: Currency;

  @Field(() => WalletStatus)
  status: WalletStatus;

  @Field({ nullable: true })
  blockedAt?: Date;

  @Field({ nullable: true })
  blockedReason?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
