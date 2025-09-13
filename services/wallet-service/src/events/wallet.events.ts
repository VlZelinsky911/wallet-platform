import { Currency, WalletStatus } from '../wallets/wallet.schema';

export interface WalletCreatedEvent {
  type: 'wallet.created';
  occurredAt: Date;
  data: {
    walletId: string;
    userId: string;
    walletNumber: string;
    currency: Currency;
    status: WalletStatus;
  };
  version: '1.0';
}

export interface WalletToppedUpEvent {
  type: 'wallet.topped_up';
  occurredAt: Date;
  data: {
    walletId: string;
    transactionId: string;
    amount: number;
    currency: Currency;
    newBalance: number;
    description?: string;
  };
  version: '1.0';
}

export interface WalletTransferredEvent {
  type: 'wallet.transferred';
  occurredAt: Date;
  data: {
    transactionId: string;
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    currency: Currency;
    fromWalletNewBalance: number;
    toWalletNewBalance: number;
    description?: string;
  };
  version: '1.0';
}

export interface WalletUpdatedEvent {
  type: 'wallet.updated';
  occurredAt: Date;
  data: {
    walletId: string;
    status?: WalletStatus;
    blockedReason?: string;
  };
  version: '1.0';
}

export interface UserCreatedEvent {
  type: 'user.created';
  occurredAt: Date;
  data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };
  version: '1.0';
}
