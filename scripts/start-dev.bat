@echo off
echo 🚀 Starting Wallet Platform in Development Mode...

REM Start infrastructure services first
echo 📦 Starting infrastructure services...
docker-compose -f docker-compose.dev.yml up -d mongo-auth mongo-users mongo-wallets redis rabbitmq

REM Wait for infrastructure to be healthy
echo ⏳ Waiting for infrastructure to be ready...
timeout /t 30 /nobreak

REM Start application services
echo 🔧 Starting application services...
docker-compose -f docker-compose.dev.yml up -d auth-service user-service wallet-service

REM Wait for application services to be healthy
echo ⏳ Waiting for application services to be ready...
timeout /t 40 /nobreak

REM Finally start the gateway
echo 🌐 Starting Gateway Service...
docker-compose -f docker-compose.dev.yml up -d gateway-service

echo ✅ All services started!
echo.
echo 🌐 Gateway GraphQL Playground: http://localhost:4000/graphql
echo 🔐 Auth Service: http://localhost:3000/health
echo 👥 User Service: http://localhost:3001/health  
echo 💰 Wallet Service: http://localhost:3002/health
echo.
echo 📊 Monitoring:
echo 🐰 RabbitMQ: http://localhost:15672 (dev_user/dev_password)
echo 📊 Grafana: http://localhost:3000 (admin/admin)
echo.
