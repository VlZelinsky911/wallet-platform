import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ValidationPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Wallet } from '../wallets/wallet.types';
import { Transaction } from '../transactions/transaction.types';
import {
  CreateWalletInput,
  UpdateWalletInput,
  TopUpInput,
  TransferInput,
} from '../wallets/wallet.inputs';

@Resolver(() => Wallet)
export class WalletResolver {
  constructor(private readonly walletService: WalletService) {}

  @Mutation(() => Wallet)
  async createWallet(
    @Args('createWalletInput', new ValidationPipe())
    createWalletInput: CreateWalletInput,
  ): Promise<Wallet> {
    return this.walletService.createWallet(createWalletInput);
  }

  @Query(() => [Wallet], { name: 'wallets' })
  async findAllWallets(): Promise<Wallet[]> {
    return this.walletService.findAllWallets();
  }

  @Query(() => Wallet, { name: 'wallet' })
  async findWalletById(@Args('id') id: string): Promise<Wallet> {
    return this.walletService.findWalletById(id);
  }

  @Query(() => [Wallet], { name: 'walletsByUserId' })
  async findWalletsByUserId(@Args('userId') userId: string): Promise<Wallet[]> {
    return this.walletService.findWalletsByUserId(userId);
  }

  @Mutation(() => Wallet)
  async updateWallet(
    @Args('updateWalletInput', new ValidationPipe())
    updateWalletInput: UpdateWalletInput,
  ): Promise<Wallet> {
    return this.walletService.updateWallet(updateWalletInput);
  }

  @Mutation(() => Transaction)
  async topUpWallet(
    @Args('topUpInput', new ValidationPipe()) topUpInput: TopUpInput,
  ): Promise<Transaction> {
    return this.walletService.topUp(topUpInput);
  }

  @Mutation(() => Transaction)
  async transferMoney(
    @Args('transferInput', new ValidationPipe()) transferInput: TransferInput,
  ): Promise<Transaction> {
    return this.walletService.transfer(transferInput);
  }

  @Query(() => [Transaction], { name: 'walletTransactions' })
  async findTransactionsByWalletId(
    @Args('walletId') walletId: string,
  ): Promise<Transaction[]> {
    return this.walletService.findTransactionsByWalletId(walletId);
  }
}
