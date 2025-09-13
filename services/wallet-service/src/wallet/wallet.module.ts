import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletResolver } from './wallet.resolver';
import { WalletService } from './wallet.service';
import { Wallet, WalletSchema } from '../wallets/wallet.schema';
import {
  Transaction,
  TransactionSchema,
} from '../transactions/transaction.schema';
import { MessagingModule } from '../messaging/messaging.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
    MessagingModule,
  ],
  providers: [WalletResolver, WalletService],
  exports: [WalletService],
})
export class WalletModule {}
