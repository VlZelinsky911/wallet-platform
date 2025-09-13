import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Wallet,
  WalletDocument,
  WalletStatus,
  Currency,
} from '../wallets/wallet.schema';
import {
  Transaction,
  TransactionDocument,
  TransactionType as TransactionTypeEnum,
  TransactionStatus,
} from '../transactions/transaction.schema';
import { Wallet as WalletType } from '../wallets/wallet.types';
import { Transaction as TransactionType } from '../transactions/transaction.types';
import {
  CreateWalletInput,
  UpdateWalletInput,
  TopUpInput,
  TransferInput,
} from '../wallets/wallet.inputs';
import { RabbitMQService } from '../messaging/rabbitmq.service';
import {
  WalletCreatedEvent,
  WalletToppedUpEvent,
  WalletTransferredEvent,
  WalletUpdatedEvent,
} from '../events/wallet.events';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Transaction.name)
    private transactionModel: Model<TransactionDocument>,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async createWallet(
    createWalletInput: CreateWalletInput,
  ): Promise<WalletType> {
    // Check if user already has a wallet
    const existingWallet = await this.walletModel.findOne({
      userId: createWalletInput.userId,
    });
    if (existingWallet) {
      throw new ConflictException('User already has a wallet');
    }

    // Generate unique wallet number
    const walletNumber = this.generateWalletNumber();

    const createdWallet = new this.walletModel({
      ...createWalletInput,
      walletNumber,
      balance: 0,
      status: WalletStatus.ACTIVE,
    });

    const savedWallet = await createdWallet.save();

    // Publish wallet.created event
    const event: WalletCreatedEvent = {
      type: 'wallet.created',
      occurredAt: new Date(),
      data: {
        walletId: (savedWallet._id as string).toString(),
        userId: savedWallet.userId.toString(),
        walletNumber: savedWallet.walletNumber,
        currency: savedWallet.currency,
        status: savedWallet.status,
      },
      version: '1.0',
    };

    await this.rabbitMQService.publishWalletCreated(event);

    return this.mapWalletToDTO(savedWallet);
  }

  async findAllWallets(): Promise<WalletType[]> {
    const wallets = await this.walletModel.find().exec();
    return wallets.map((wallet) => this.mapWalletToDTO(wallet));
  }

  async findWalletById(id: string): Promise<WalletType> {
    const wallet = await this.walletModel.findById(id).exec();
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
    return this.mapWalletToDTO(wallet);
  }

  async findWalletsByUserId(userId: string): Promise<WalletType[]> {
    const wallets = await this.walletModel.find({ userId }).exec();
    return wallets.map((wallet) => this.mapWalletToDTO(wallet));
  }

  async updateWallet(
    updateWalletInput: UpdateWalletInput,
  ): Promise<WalletType> {
    const { id, ...updateData } = updateWalletInput;

    const wallet = await this.walletModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .exec();

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }

    // Publish wallet.updated event
    const event: WalletUpdatedEvent = {
      type: 'wallet.updated',
      occurredAt: new Date(),
      data: {
        walletId: (wallet._id as string).toString(),
        ...updateData,
      },
      version: '1.0',
    };

    await this.rabbitMQService.publishWalletUpdated(event);

    return this.mapWalletToDTO(wallet);
  }

  async topUp(topUpInput: TopUpInput): Promise<TransactionType> {
    const wallet = await this.walletModel.findById(topUpInput.walletId);
    if (!wallet) {
      throw new NotFoundException(
        `Wallet with ID ${topUpInput.walletId} not found`,
      );
    }

    if (wallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('Wallet is not active');
    }

    const transactionId = uuidv4();

    // Create transaction
    const transaction = new this.transactionModel({
      transactionId,
      fromWalletId: wallet._id,
      amount: topUpInput.amount,
      currency: wallet.currency,
      type: TransactionTypeEnum.TOP_UP,
      status: TransactionStatus.PENDING,
      description: topUpInput.description,
    });

    const savedTransaction = await transaction.save();

    try {
      // Update wallet balance
      const newBalance = wallet.balance + topUpInput.amount;
      await this.walletModel.findByIdAndUpdate(
        wallet._id,
        { balance: newBalance },
        { new: true },
      );

      // Mark transaction as completed
      savedTransaction.status = TransactionStatus.COMPLETED;
      savedTransaction.processedAt = new Date();
      await savedTransaction.save();

      // Publish wallet.topped_up event
      const event: WalletToppedUpEvent = {
        type: 'wallet.topped_up',
        occurredAt: new Date(),
        data: {
          walletId: (wallet._id as string).toString(),
          transactionId: savedTransaction.transactionId,
          amount: topUpInput.amount,
          currency: wallet.currency,
          newBalance,
          description: topUpInput.description,
        },
        version: '1.0',
      };

      await this.rabbitMQService.publishWalletToppedUp(event);

      return this.mapTransactionToDTO(savedTransaction);
    } catch (error) {
      // Mark transaction as failed
      savedTransaction.status = TransactionStatus.FAILED;
      savedTransaction.failureReason = error.message;
      await savedTransaction.save();
      throw error;
    }
  }

  async transfer(transferInput: TransferInput): Promise<TransactionType> {
    const [fromWallet, toWallet] = await Promise.all([
      this.walletModel.findById(transferInput.fromWalletId),
      this.walletModel.findById(transferInput.toWalletId),
    ]);

    if (!fromWallet) {
      throw new NotFoundException(
        `Source wallet with ID ${transferInput.fromWalletId} not found`,
      );
    }

    if (!toWallet) {
      throw new NotFoundException(
        `Destination wallet with ID ${transferInput.toWalletId} not found`,
      );
    }

    if (fromWallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('Source wallet is not active');
    }

    if (toWallet.status !== WalletStatus.ACTIVE) {
      throw new BadRequestException('Destination wallet is not active');
    }

    if (fromWallet.currency !== toWallet.currency) {
      throw new BadRequestException('Wallets have different currencies');
    }

    if (fromWallet.balance < transferInput.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    const transactionId = uuidv4();

    // Create transaction
    const transaction = new this.transactionModel({
      transactionId,
      fromWalletId: fromWallet._id,
      toWalletId: toWallet._id,
      amount: transferInput.amount,
      currency: fromWallet.currency,
      type: TransactionTypeEnum.TRANSFER,
      status: TransactionStatus.PENDING,
      description: transferInput.description,
    });

    const savedTransaction = await transaction.save();

    try {
      // Update wallet balances
      const fromWalletNewBalance = fromWallet.balance - transferInput.amount;
      const toWalletNewBalance = toWallet.balance + transferInput.amount;

      await Promise.all([
        this.walletModel.findByIdAndUpdate(
          fromWallet._id,
          { balance: fromWalletNewBalance },
          { new: true },
        ),
        this.walletModel.findByIdAndUpdate(
          toWallet._id,
          { balance: toWalletNewBalance },
          { new: true },
        ),
      ]);

      // Mark transaction as completed
      savedTransaction.status = TransactionStatus.COMPLETED;
      savedTransaction.processedAt = new Date();
      await savedTransaction.save();

      // Publish wallet.transferred event
      const event: WalletTransferredEvent = {
        type: 'wallet.transferred',
        occurredAt: new Date(),
        data: {
          transactionId: savedTransaction.transactionId,
          fromWalletId: (fromWallet._id as string).toString(),
          toWalletId: (toWallet._id as string).toString(),
          amount: transferInput.amount,
          currency: fromWallet.currency,
          fromWalletNewBalance,
          toWalletNewBalance,
          description: transferInput.description,
        },
        version: '1.0',
      };

      await this.rabbitMQService.publishWalletTransferred(event);

      return this.mapTransactionToDTO(savedTransaction);
    } catch (error) {
      // Mark transaction as failed
      savedTransaction.status = TransactionStatus.FAILED;
      savedTransaction.failureReason = error.message;
      await savedTransaction.save();
      throw error;
    }
  }

  async findTransactionsByWalletId(
    walletId: string,
  ): Promise<TransactionType[]> {
    const transactions = await this.transactionModel
      .find({
        $or: [{ fromWalletId: walletId }, { toWalletId: walletId }],
      })
      .sort({ createdAt: -1 })
      .exec();

    return transactions.map((transaction) =>
      this.mapTransactionToDTO(transaction),
    );
  }

  // Handler for user.created event
  async handleUserCreated(userId: string): Promise<void> {
    try {
      await this.createWallet({
        userId,
        currency: Currency.USD,
      });
      this.logger.log(`Created wallet for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to create wallet for user ${userId}`, error);
    }
  }

  private generateWalletNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `WAL-${timestamp.slice(-8)}-${random}`;
  }

  private mapWalletToDTO(wallet: WalletDocument): WalletType {
    return {
      id: (wallet._id as string).toString(),
      userId: wallet.userId.toString(),
      walletNumber: wallet.walletNumber,
      balance: wallet.balance,
      currency: wallet.currency,
      status: wallet.status,
      blockedAt: wallet.blockedAt,
      blockedReason: wallet.blockedReason,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  private mapTransactionToDTO(
    transaction: TransactionDocument,
  ): TransactionType {
    return {
      id: (transaction._id as string).toString(),
      transactionId: transaction.transactionId,
      fromWalletId: transaction.fromWalletId.toString(),
      toWalletId: transaction.toWalletId?.toString(),
      amount: transaction.amount,
      currency: transaction.currency,
      type: transaction.type,
      status: transaction.status,
      description: transaction.description,
      failureReason: transaction.failureReason,
      processedAt: transaction.processedAt,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
