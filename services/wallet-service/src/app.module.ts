import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriverConfig,
  ApolloFederationDriver,
} from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WalletModule } from './wallet/wallet.module';
import { MessagingModule } from './messaging/messaging.module';
import { RabbitMQService } from './messaging/rabbitmq.service';
import { WalletService } from './wallet/wallet.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://mongo-wallets:27017/wallet-service',
    ),
    MessagingModule,
    WalletModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly walletService: WalletService,
  ) {}

  async onModuleInit() {
    // Start consuming user.created events
    await this.rabbitMQService.consumeUserCreatedEvents(async (event) => {
      await this.walletService.handleUserCreated(event.data.userId);
    });
  }
}
