import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import {
  WalletCreatedEvent,
  WalletToppedUpEvent,
  WalletTransferredEvent,
  WalletUpdatedEvent,
  UserCreatedEvent,
} from '../events/wallet.events';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: any = null;
  private channel: any = null;
  private readonly exchangeName = 'wallet-platform';

  async onModuleInit() {
    try {
      await this.connect();
      await this.setupExchange();
      await this.setupQueues();
    } catch (error) {
      this.logger.error('Failed to initialize RabbitMQ connection', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
    } catch (error) {
      this.logger.error('Error closing RabbitMQ connection', error);
    }
  }

  private async connect() {
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    this.connection = await amqp.connect(rabbitmqUrl);
    this.channel = await this.connection.createChannel();
    this.logger.log('Connected to RabbitMQ');
  }

  private async setupExchange() {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }
    await this.channel.assertExchange(this.exchangeName, 'topic', {
      durable: true,
    });
    this.logger.log(`Exchange '${this.exchangeName}' is ready`);
  }

  private async setupQueues() {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    // Queue for listening to user.created events
    const userCreatedQueue = 'wallet-service.user-created';
    await this.channel.assertQueue(userCreatedQueue, { durable: true });
    await this.channel.bindQueue(
      userCreatedQueue,
      this.exchangeName,
      'user.created',
    );

    this.logger.log(`Queue '${userCreatedQueue}' is ready`);
  }

  async publishWalletCreated(event: WalletCreatedEvent): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const routingKey = 'wallet.created';
    const message = Buffer.from(JSON.stringify(event));

    try {
      await this.channel.publish(this.exchangeName, routingKey, message, {
        persistent: true,
        timestamp: Date.now(),
      });
      this.logger.log(
        `Published wallet.created event for wallet ${event.data.walletId}`,
      );
    } catch (error) {
      this.logger.error('Failed to publish wallet.created event', error);
      throw error;
    }
  }

  async publishWalletToppedUp(event: WalletToppedUpEvent): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const routingKey = 'wallet.topped_up';
    const message = Buffer.from(JSON.stringify(event));

    try {
      await this.channel.publish(this.exchangeName, routingKey, message, {
        persistent: true,
        timestamp: Date.now(),
      });
      this.logger.log(
        `Published wallet.topped_up event for wallet ${event.data.walletId}`,
      );
    } catch (error) {
      this.logger.error('Failed to publish wallet.topped_up event', error);
      throw error;
    }
  }

  async publishWalletTransferred(event: WalletTransferredEvent): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const routingKey = 'wallet.transferred';
    const message = Buffer.from(JSON.stringify(event));

    try {
      await this.channel.publish(this.exchangeName, routingKey, message, {
        persistent: true,
        timestamp: Date.now(),
      });
      this.logger.log(
        `Published wallet.transferred event for transaction ${event.data.transactionId}`,
      );
    } catch (error) {
      this.logger.error('Failed to publish wallet.transferred event', error);
      throw error;
    }
  }

  async publishWalletUpdated(event: WalletUpdatedEvent): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const routingKey = 'wallet.updated';
    const message = Buffer.from(JSON.stringify(event));

    try {
      await this.channel.publish(this.exchangeName, routingKey, message, {
        persistent: true,
        timestamp: Date.now(),
      });
      this.logger.log(
        `Published wallet.updated event for wallet ${event.data.walletId}`,
      );
    } catch (error) {
      this.logger.error('Failed to publish wallet.updated event', error);
      throw error;
    }
  }

  async consumeUserCreatedEvents(
    callback: (event: UserCreatedEvent) => Promise<void>,
  ): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const queueName = 'wallet-service.user-created';

    await this.channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const event: UserCreatedEvent = JSON.parse(msg.content.toString());
          await callback(event);
          this.channel.ack(msg);
          this.logger.log(
            `Processed user.created event for user ${event.data.userId}`,
          );
        } catch (error) {
          this.logger.error('Failed to process user.created event', error);
          this.channel.nack(msg, false, false); // Dead letter or discard
        }
      }
    });

    this.logger.log('Started consuming user.created events');
  }
}
