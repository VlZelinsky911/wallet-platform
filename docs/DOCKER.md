# 🐳 Docker Guide

Повний гід по роботі з Docker у Wallet Platform проекті.

## 📋 Загальна інформація

Проект використовує **Docker Compose** для оркестрації мікросервісів та **multi-stage Dockerfiles** для оптимізації розміру образів.

### Архітектура Docker

```
┌─────────────────────────────────────────────────────────────┐
│                    Docker Network                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Auth Service │  │User Service │  │Wallet Service│        │
│  │   :5000     │  │   :5001     │  │   :5002     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ MongoDB     │  │ MongoDB     │  │ MongoDB     │        │
│  │ auth-db     │  │ users-db    │  │wallets-db   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                            │
│  ┌─────────────────────────────┐                          │
│  │        RabbitMQ             │                          │
│  │    :5672 / :15672          │                          │
│  └─────────────────────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Запуск проекту

### Базовий запуск

```bash
# Запуск всіх сервісів
docker-compose up -d

# З білдом образів
docker-compose up --build -d

# Тільки інфраструктурні сервіси
docker-compose up -d rabbitmq mongo-auth mongo-users mongo-wallets
```

### Запуск конкретних сервісів

```bash
# Тільки auth-service
docker-compose up -d auth-service

# Auth + User services
docker-compose up -d auth-service user-service

# Всі app сервіси (без MongoDB та RabbitMQ)
docker-compose up -d auth-service user-service wallet-service
```

## 📊 Моніторинг та логи

### Перегляд статусу

```bash
# Статус всіх контейнерів
docker ps

# Детальна інформація
docker-compose ps

# Використання ресурсів
docker stats
```

### Логи

```bash
# Логи всіх сервісів
docker-compose logs

# Логи конкретного сервісу
docker-compose logs auth-service

# Live логи
docker-compose logs -f auth-service

# Останні 100 рядків
docker-compose logs --tail=100 auth-service

# Логи з timestamp
docker-compose logs -t auth-service
```

### Health Checks

```bash
# Перевірка здоров'я сервісів
docker-compose ps

# Детальна перевірка
curl http://localhost:5000/health  # Auth Service
curl http://localhost:5001/health  # User Service
curl http://localhost:5002/health  # Wallet Service
```

## 🔧 Керування контейнерами

### Зупинка та перезапуск

```bash
# Зупинка всіх сервісів
docker-compose down

# Зупинка з видаленням volumes (ОБЕРЕЖНО!)
docker-compose down -v

# Зупинка конкретного сервісу
docker-compose stop auth-service

# Перезапуск сервісу
docker-compose restart auth-service

# Перезапуск з білдом
docker-compose up --build -d auth-service
```

### Масштабування

```bash
# Запуск кількох інстансів
docker-compose up -d --scale auth-service=3

# Перевірка
docker-compose ps auth-service
```

## 🛠️ Debugging та troubleshooting

### Підключення до контейнера

```bash
# Виконання команди в контейнері
docker-compose exec auth-service bash

# Альтернативний спосіб
docker exec -it wallet-platform-auth-service-1 bash

# Виконання разової команди
docker-compose exec auth-service npm run test
```

### Перегляд конфігурації

```bash
# Перевірка змінних середовища
docker-compose exec auth-service env

# Перевірка мережевої конфігурації
docker network ls
docker network inspect wallet-platform_default
```

### Debugging портів

```bash
# Перевірка відкритих портів
netstat -tulpn | grep :5000

# Тестування підключення
telnet localhost 5000
nc -zv localhost 5000
```

## 🗄️ Робота з volumes

### Перегляд volumes

```bash
# Список всіх volumes
docker volume ls

# Інформація про volume
docker volume inspect wallet-platform_mongo-auth

# Очистка невикористовуваних volumes
docker volume prune
```

### Backup та restore

```bash
# Backup MongoDB
docker-compose exec mongo-auth mongodump --out /data/backup
docker cp wallet-platform-mongo-auth-1:/data/backup ./backup

# Restore MongoDB
docker cp ./backup wallet-platform-mongo-auth-1:/data/restore
docker-compose exec mongo-auth mongorestore /data/restore
```

## 🔨 Білд образів

### Локальний білд

```bash
# Білд всіх сервісів
docker-compose build

# Білд конкретного сервісу
docker-compose build auth-service

# Білд без кешу
docker-compose build --no-cache auth-service

# Білд з pull останніх базових образів
docker-compose build --pull
```

### Ручний білд

```bash
# Білд auth-service
cd services/auth-service
docker build -t auth-service .

# З конкретним тегом
docker build -t auth-service:v1.0.0 .

# З production Dockerfile
docker build -f Dockerfile.prod -t auth-service:prod .
```

## 🌍 Мережа

### Мережева конфігурація

```bash
# Перегляд мереж
docker network ls

# Інспекція мережі проекту
docker network inspect wallet-platform_default

# Тестування connectivity між сервісами
docker-compose exec auth-service ping mongo-auth
docker-compose exec user-service nc -zv rabbitmq 5672
```

### Custom мережа

```yaml
# docker-compose.yml
networks:
  wallet-network:
    name: wallet_platform_network
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## ⚡ Оптимізація продуктивності

### Dockerfile оптимізації

```dockerfile
# Multi-stage build для зменшення розміру
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./
CMD ["node", "dist/main.js"]
```

### Docker Compose оптимізації

```yaml
services:
  auth-service:
    build: ./services/auth-service
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "0.5"
        reservations:
          memory: 256M
          cpus: "0.25"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## 🔒 Безпека

### Secrets управління

```yaml
# docker-compose.yml
services:
  auth-service:
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
    secrets:
      - jwt_secret

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

### Non-root користувач

```dockerfile
# Створення користувача
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Використання non-root
USER nestjs
```

## 📝 Environment конфігурації

### Development

```yaml
# docker-compose.dev.yml
services:
  auth-service:
    build:
      context: ./services/auth-service
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=development
      - LOG_LEVEL=debug
    volumes:
      - ./services/auth-service/src:/app/src:ro
    command: npm run start:dev
```

### Production

```yaml
# docker-compose.prod.yml
services:
  auth-service:
    build:
      context: ./services/auth-service
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
```

### Testing

```yaml
# docker-compose.test.yml
services:
  auth-service-test:
    build:
      context: ./services/auth-service
      dockerfile: Dockerfile.test
    environment:
      - NODE_ENV=test
      - MONGO_URI_AUTH=mongodb://mongo-test:27017/auth_test
    command: npm run test:e2e
```

## 🧹 Очистка та обслуговування

### Регулярна очистка

```bash
# Очистка невикористовуваних образів
docker image prune

# Очистка всіх невикористовуваних ресурсів
docker system prune

# Агресивна очистка (ОБЕРЕЖНО!)
docker system prune -a

# Очистка volumes
docker volume prune

# Очистка мереж
docker network prune
```

### Моніторинг розміру

```bash
# Розмір образів
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Використання диску Docker
docker system df

# Детальна інформація
docker system df -v
```

## 🆘 Troubleshooting

### Поширені проблеми

#### Port already in use

```bash
# Знайти процес що використовує порт
netstat -tulpn | grep :5000
lsof -i :5000

# Звільнити порт
docker-compose down
```

#### Out of disk space

```bash
# Очистка Docker
docker system prune -a
docker volume prune

# Перевірка використання диску
df -h
docker system df
```

#### Container fails to start

```bash
# Перегляд логів
docker-compose logs service-name

# Перевірка health check
docker inspect container-name

# Тестування в debug режимі
docker-compose run --rm service-name bash
```

#### Network connectivity issues

```bash
# Перевірка DNS resolution
docker-compose exec auth-service nslookup mongo-auth

# Тестування портів
docker-compose exec auth-service nc -zv mongo-auth 27017

# Перевірка firewall
sudo ufw status
```

### Performance issues

```bash
# Моніторинг ресурсів
docker stats

# Memory usage
docker-compose exec auth-service cat /proc/meminfo

# CPU usage
docker-compose exec auth-service top
```

## 📚 Корисні команди

### Швидкі команди

```bash
# Alias для зручності
alias dps='docker ps'
alias dcl='docker-compose logs'
alias dcu='docker-compose up'
alias dcd='docker-compose down'

# Функція для швидкого підключення
dbash() {
  docker-compose exec $1 bash
}

# Використання: dbash auth-service
```

### Scripts для автоматизації

```bash
#!/bin/bash
# start.sh - Скрипт запуску проекту

echo "🚀 Starting Wallet Platform..."

# Очистка старих контейнерів
docker-compose down

# Запуск з білдом
docker-compose up --build -d

# Очікування готовності сервісів
echo "⏳ Waiting for services to be ready..."
sleep 30

# Перевірка здоров'я
echo "🔍 Health check..."
curl -f http://localhost:5000/health && echo "✅ Auth Service OK"
curl -f http://localhost:5001/health && echo "✅ User Service OK"
curl -f http://localhost:5002/health && echo "✅ Wallet Service OK"

echo "🎉 Wallet Platform is ready!"
```

---

**💡 Tip**: Для production використовуйте Docker Swarm або Kubernetes для кращої оркестрації та масштабування.
