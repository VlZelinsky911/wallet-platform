import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import {
  UserCreatedEvent,
  UserUpdatedEvent,
  UserDeletedEvent,
} from '../users/user.events';

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

  async publishUserCreated(event: UserCreatedEvent): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const routingKey = 'user.created';
    const message = Buffer.from(JSON.stringify(event));

    try {
      await this.channel.publish(this.exchangeName, routingKey, message, {
        persistent: true,
        timestamp: Date.now(),
      });
      this.logger.log(
        `Published user.created event for user ${event.data.userId}`,
      );
    } catch (error) {
      this.logger.error('Failed to publish user.created event', error);
      throw error;
    }
  }

  async publishUserUpdated(event: UserUpdatedEvent): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const routingKey = 'user.updated';
    const message = Buffer.from(JSON.stringify(event));

    try {
      await this.channel.publish(this.exchangeName, routingKey, message, {
        persistent: true,
        timestamp: Date.now(),
      });
      this.logger.log(
        `Published user.updated event for user ${event.data.userId}`,
      );
    } catch (error) {
      this.logger.error('Failed to publish user.updated event', error);
      throw error;
    }
  }

  async publishUserDeleted(event: UserDeletedEvent): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const routingKey = 'user.deleted';
    const message = Buffer.from(JSON.stringify(event));

    try {
      await this.channel.publish(this.exchangeName, routingKey, message, {
        persistent: true,
        timestamp: Date.now(),
      });
      this.logger.log(
        `Published user.deleted event for user ${event.data.userId}`,
      );
    } catch (error) {
      this.logger.error('Failed to publish user.deleted event', error);
      throw error;
    }
  }
}
