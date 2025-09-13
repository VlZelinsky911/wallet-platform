#!/bin/bash

echo "🚀 Starting Wallet Platform in Development Mode..."

# Start infrastructure services first
echo "📦 Starting infrastructure services..."
docker-compose -f docker-compose.dev.yml up -d mongo-auth mongo-users mongo-wallets redis rabbitmq

# Wait for infrastructure to be healthy
echo "⏳ Waiting for infrastructure to be ready..."
docker-compose -f docker-compose.dev.yml up --wait mongo-auth mongo-users mongo-wallets redis rabbitmq

# Start application services
echo "🔧 Starting application services..."
docker-compose -f docker-compose.dev.yml up -d auth-service user-service wallet-service

# Wait for application services to be healthy
echo "⏳ Waiting for application services to be ready..."
sleep 30

# Finally start the gateway
echo "🌐 Starting Gateway Service..."
docker-compose -f docker-compose.dev.yml up -d gateway-service

echo "✅ All services started!"
echo ""
echo "🌐 Gateway GraphQL Playground: http://localhost:4000/graphql"
echo "🔐 Auth Service: http://localhost:3000/health"
echo "👥 User Service: http://localhost:3001/health"  
echo "💰 Wallet Service: http://localhost:3002/health"
echo ""
echo "📊 Monitoring:"
echo "🐰 RabbitMQ: http://localhost:15672 (dev_user/dev_password)"
echo "📊 Grafana: http://localhost:3000 (admin/admin)"
echo ""
