import { Module } from '@nestjs/common';
import { WalletResolver } from './wallet.resolver';
import { WalletService } from './wallet.service';

@Module({
  providers: [WalletResolver, WalletService]
})
export class WalletModule {}
