import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from "@nestjs/apollo";
import { IntrospectAndCompose, RemoteGraphQLDataSource } from "@apollo/gateway";
import { AuthModule } from "./auth/auth.module";
import { GatewayService } from "./gateway/gateway.service";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      imports: [AuthModule],
      useFactory: () => ({
        gateway: {
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              {
                name: "auth",
                url:
                  process.env.AUTH_SERVICE_URL ||
                  "http://auth-service:3000/graphql",
              },
              {
                name: "users",
                url:
                  process.env.USER_SERVICE_URL ||
                  "http://user-service:3001/graphql",
              },
              // Тимчасово відключений поки не буде виправлений wallet-service
              // {
              //   name: "wallets",
              //   url:
              //     process.env.WALLET_SERVICE_URL ||
              //     "http://wallet-service:3002/graphql",
              // },
            ],
            // Більш м'які налаштування для development
            introspectionHeaders: {
              "User-Agent": "gateway-service",
            },
            pollIntervalInMs:
              process.env.NODE_ENV === "development" ? 5000 : 30000,
          }),
          buildService: ({ url }) => {
            return new RemoteGraphQLDataSource({
              url,
              willSendRequest({ request, context }) {
                // Forward JWT token to subgraphs
                if (context.req?.headers?.authorization) {
                  request.http?.headers.set(
                    "authorization",
                    context.req.headers.authorization
                  );
                }

                // Forward user context to subgraphs
                if (context.user) {
                  request.http?.headers.set("x-user-id", context.user.userId);
                  request.http?.headers.set(
                    "x-user-roles",
                    JSON.stringify(context.user.roles)
                  );
                }
              },
            });
          },
        },
        server: {
          context: ({ req }: { req: any }) => {
            return { req };
          },
          introspection: process.env.NODE_ENV !== "production",
          playground: process.env.NODE_ENV !== "production",
        },
      }),
    }),
    AuthModule,
  ],
  providers: [GatewayService],
  controllers: [HealthController],
})
export class AppModule {}
