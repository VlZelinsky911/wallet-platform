import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      playground: true,
      introspection: true,
      csrfPrevention: false,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://dev_user:dev_password@mongo-auth:27017/auth-service?authSource=admin',
    ),
    AuthModule,
    UsersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
