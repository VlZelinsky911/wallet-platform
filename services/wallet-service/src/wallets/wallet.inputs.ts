import { InputType, Field, ID } from '@nestjs/graphql';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
  IsUUID,
} from 'class-validator';
import { Currency, WalletStatus } from './wallet.schema';

@InputType()
export class CreateWalletInput {
  @Field()
  @IsString()
  userId: string;

  @Field(() => Currency, { defaultValue: Currency.USD })
  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;
}

@InputType()
export class UpdateWalletInput {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field(() => WalletStatus, { nullable: true })
  @IsOptional()
  @IsEnum(WalletStatus)
  status?: WalletStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  blockedReason?: string;
}

@InputType()
export class TopUpInput {
  @Field(() => ID)
  @IsString()
  walletId: string;

  @Field()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class TransferInput {
  @Field(() => ID)
  @IsString()
  fromWalletId: string;

  @Field(() => ID)
  @IsString()
  toWalletId: string;

  @Field()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
