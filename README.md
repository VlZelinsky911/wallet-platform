# 💰 Wallet Platform

Мікросервісна платформа для управління цифровими гаманцями з використанням Apollo Federation, NestJS, GraphQL, MongoDB та RabbitMQ.

## 🏗️ Архітектура

```
                    ┌─────────────────────┐
                    │  Gateway Service    │
                    │      (4000)         │
                    │  Apollo Federation  │
                    │   GraphQL Gateway   │
                    └─────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Auth Service  │  │  User Service   │  │ Wallet Service  │
│     (3000)      │  │     (3001)      │  │     (3002)      │
│  GraphQL + JWT  │  │   GraphQL API   │  │   GraphQL API   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                   │                   │
         │                   └─────────┼─────────┘
         │                             │
         │              ┌─────────────────────┐
         │              │     RabbitMQ        │
         │              │      (5672)         │
         │              │   Management UI     │
         │              │     (15672)         │
         │              └─────────────────────┘
         │                             │
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   MongoDB       │  │   MongoDB       │  │   MongoDB       │
│   Auth DB       │  │   Users DB      │  │  Wallets DB     │
│   (27017)       │  │   (27018)       │  │   (27019)       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                   │                   │
         └─────────────────  │  ─────────────────┘
                    ┌─────────────────────┐
                    │      Redis          │
                    │      (6379)         │
                    │   Session Store     │
                    └─────────────────────┘
```

## 🚀 Швидкий старт

### Попередні вимоги

- Docker Desktop
- Node.js 20+ (для локальної розробки)
- Git

### Запуск проекту

```bash
# Клонування репозиторію
git clone <repository-url>
cd wallet-platform

# Створення .env файлу
cp env.example .env

# Запуск всіх сервісів
docker-compose -f docker-compose.dev.yml up -d

# Перевірка статусу
docker-compose -f docker-compose.dev.yml ps
```

### Перевірка роботи

```bash
# Gateway Service - єдина точка входу для всіх GraphQL запитів
curl http://localhost:4000/graphql

# Окремі сервіси (для перевірки)
curl http://localhost:3000        # Auth Service: "Auth Service is running!"
curl http://localhost:3001        # User Service: "User Service is running!"
curl http://localhost:3002        # Wallet Service: "Wallet Service is running!"

# Health endpoints
curl http://localhost:3000/health # Auth Service health
curl http://localhost:3001/health # User Service health
curl http://localhost:3002/health # Wallet Service health

# RabbitMQ Management UI
http://localhost:15672 (dev_user/dev_password)
```

## 📋 Сервіси

| Сервіс              | Порт | Технології                         | Опис                                 |
| ------------------- | ---- | ---------------------------------- | ------------------------------------ |
| **Gateway Service** | 4000 | NestJS, Apollo Federation, GraphQL | Єдина точка входу, об'єднує всі API  |
| **Auth Service**    | 3000 | NestJS, GraphQL, JWT, MongoDB      | Автентифікація та авторизація        |
| **User Service**    | 3001 | NestJS, GraphQL, MongoDB, RabbitMQ | Управління користувачами             |
| **Wallet Service**  | 3002 | NestJS, GraphQL, MongoDB, RabbitMQ | Управління гаманцями та транзакціями |

## 🔗 Endpoints

### 🌟 Gateway Service (Головний API)

- **URL**: http://localhost:4000/graphql
- **Playground**: http://localhost:4000/graphql (у браузері)

**Особливості:**

- Єдина точка входу для всіх GraphQL запитів
- Apollo Federation - автоматично об'єднує схеми всіх сервісів
- JWT авторизація та передача контексту між сервісами
- Introspection та Playground доступні в development режимі

### 🔐 Auth Service

- **URL**: http://localhost:3000/graphql
- **Health**: http://localhost:3000/health
- **Status**: http://localhost:3000 → "Auth Service is running!"

**Доступні операції:**

```graphql
# Ping перевірка
query {
  ping
}

# Реєстрація користувача
mutation {
  register(
    input: {
      email: "user@example.com"
      password: "password123"
      name: "John Doe"
    }
  ) {
    accessToken
    userId
    roles
  }
}

# Авторизація
mutation {
  login(input: { email: "user@example.com", password: "password123" }) {
    accessToken
    userId
    roles
  }
}
```

### 👤 User Service

- **URL**: http://localhost:3001/graphql
- **Health**: http://localhost:3001/health
- **Status**: http://localhost:3001 → "User Service is running!"

**Доступні операції:**

```graphql
# Створення користувача
mutation {
  createUser(
    createUserInput: {
      email: "user@example.com"
      firstName: "John"
      lastName: "Doe"
      phone: "+1234567890"
    }
  ) {
    id
    email
    firstName
    lastName
    isActive
  }
}

# Отримання користувачів
query {
  users {
    id
    email
    firstName
    lastName
  }
}
```

### 💰 Wallet Service

- **URL**: http://localhost:3002/graphql
- **Health**: http://localhost:3002/health
- **Status**: http://localhost:3002 → "Wallet Service is running!"

**Доступні операції:**

```graphql
# Створення гаманця
mutation {
  createWallet(createWalletInput: { userId: "USER_ID", currency: USD }) {
    id
    userId
    walletNumber
    balance
    currency
    status
  }
}

# Поповнення гаманця
mutation {
  topUpWallet(
    topUpInput: { walletId: "WALLET_ID", amount: 100.00, description: "Top up" }
  ) {
    id
    balance
  }
}

# Переказ між гаманцями
mutation {
  transferBetweenWallets(
    transferInput: {
      fromWalletId: "FROM_WALLET_ID"
      toWalletId: "TO_WALLET_ID"
      amount: 50.00
      description: "Transfer"
    }
  ) {
    id
    type
    amount
    status
  }
}
```

## 🗄️ База даних

Проект використовує окремі MongoDB інстанси для кожного сервісу:

- **mongo-auth**: Дані автентифікації (порт 27017)
- **mongo-users**: Дані користувачів (порт 27018)
- **mongo-wallets**: Дані гаманців (порт 27019)

**Підключення до БД:**

```bash
# Auth DB
mongosh mongodb://dev_user:dev_password@localhost:27017/auth-service

# Users DB
mongosh mongodb://dev_user:dev_password@localhost:27018/user-service

# Wallets DB
mongosh mongodb://dev_user:dev_password@localhost:27019/wallet-service
```

## 🐰 Message Queue

**RabbitMQ** для асинхронної комунікації між сервісами:

- **AMQP**: localhost:5672
- **Management UI**: http://localhost:15672
- **Credentials**: dev_user/dev_password
- **Virtual Host**: wallet_platform

**Події (Events):**

- `user.created` - користувач створений (user-service → wallet-service)
- `user.updated` - користувач оновлений
- `user.deleted` - користувач видалений
- `wallet.created` - гаманець створений
- `wallet.topped_up` - гаманець поповнений
- `wallet.transferred` - переказ між гаманцями

## 🛠️ Розробка

### Локальний запуск сервісу

```bash
# Перехід до сервісу
cd services/auth-service

# Встановлення залежностей
npm install

# Запуск у режимі розробки
npm run start:dev

# Тестування
npm test
npm run test:e2e
```

### Корисні команди

```bash
# Перегляд логів всіх сервісів
docker-compose -f docker-compose.dev.yml logs -f

# Перегляд логів конкретного сервісу
docker-compose -f docker-compose.dev.yml logs -f gateway-service
docker-compose -f docker-compose.dev.yml logs -f auth-service
docker-compose -f docker-compose.dev.yml logs -f user-service
docker-compose -f docker-compose.dev.yml logs -f wallet-service

# Перезапуск сервісу
docker-compose -f docker-compose.dev.yml restart auth-service

# Зупинка всіх сервісів
docker-compose -f docker-compose.dev.yml down

# Очистка volumes (ОБЕРЕЖНО!)
docker-compose -f docker-compose.dev.yml down -v

# Білд без кешу
docker-compose -f docker-compose.dev.yml build --no-cache

# Запуск тільки основних сервісів (без моніторингу)
docker-compose -f docker-compose.dev.yml up mongo-auth mongo-users mongo-wallets redis rabbitmq auth-service user-service wallet-service gateway-service -d
```

## 📁 Структура проекту

```
wallet-platform/
├── docker-compose.yml           # Production конфігурація
├── docker-compose.dev.yml       # Development конфігурація
├── env.example                 # Приклад змінних середовища
├── README.md                   # Ця документація
├── scripts/                    # Допоміжні скрипти
│   ├── init-mongo-auth.js     # Ініціалізація MongoDB для auth
│   ├── start-dev.bat          # Windows запуск
│   └── start-dev.sh           # Unix запуск
├── services/
│   ├── gateway-service/       # Apollo Federation Gateway
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── auth/          # JWT стратегія
│   │   │   ├── guards/        # Auth guards
│   │   │   ├── decorators/    # Custom decorators
│   │   │   └── examples/      # Приклади використання
│   │   ├── Dockerfile.dev
│   │   └── package.json
│   ├── auth-service/          # Сервіс автентифікації
│   │   ├── src/
│   │   │   ├── auth/          # GraphQL resolvers
│   │   │   ├── users/         # User entities
│   │   │   └── health/        # Health checks
│   │   ├── test/
│   │   ├── Dockerfile.dev
│   │   └── package.json
│   ├── user-service/          # Сервіс користувачів
│   │   ├── src/
│   │   │   ├── users/         # User CRUD operations
│   │   │   ├── messaging/     # RabbitMQ integration
│   │   │   └── health/
│   │   ├── test/
│   │   ├── Dockerfile.dev
│   │   └── package.json
│   └── wallet-service/        # Сервіс гаманців
│       ├── src/
│       │   ├── wallet/        # Wallet operations
│       │   ├── wallets/       # Wallet entities
│       │   ├── transactions/  # Transaction entities
│       │   ├── messaging/     # RabbitMQ integration
│       │   └── events/        # Event definitions
│       ├── test/
│       ├── Dockerfile.dev
│       └── package.json
└── docs/                      # Документація
    ├── API.md                 # API документація
    ├── DOCKER.md              # Docker інструкції
    └── TESTING_GRAPHQL.md     # Посібник з тестування
```

## 🧪 Тестування

### 🎯 GraphQL Playground Тестування

**Головний спосіб тестування - через Gateway Service:**

1. Запустіть всі сервіси: `docker-compose -f docker-compose.dev.yml up -d`
2. Відкрийте: http://localhost:4000/graphql
3. Використовуйте повний посібник: [docs/TESTING_GRAPHQL.md](docs/TESTING_GRAPHQL.md)

**Швидкий тест:**

```graphql
# 1. Реєстрація користувача
mutation {
  register(
    input: {
      email: "test@example.com"
      password: "password123"
      name: "Test User"
    }
  ) {
    accessToken
    userId
    roles
  }
}

# 2. Створення профілю (використайте токен в Headers)
mutation {
  createUser(
    createUserInput: {
      email: "test@example.com"
      firstName: "Test"
      lastName: "User"
    }
  ) {
    id
    email
  }
}

# 3. Створення гаманця
mutation {
  createWallet(
    createWalletInput: { userId: "USER_ID_FROM_STEP_2", currency: USD }
  ) {
    id
    walletNumber
    balance
  }
}
```

### Unit тести

```bash
# Всі сервіси
cd services/auth-service && npm test
cd services/user-service && npm test
cd services/wallet-service && npm test
cd services/gateway-service && npm test

# З coverage
npm run test:cov
```

### E2E тести

```bash
# Конкретний сервіс
cd services/auth-service && npm run test:e2e
cd services/user-service && npm run test:e2e
cd services/wallet-service && npm run test:e2e
```

## 🔧 Конфігурація

### Змінні середовища

Створіть `.env` файл у корені проекту (або скопіюйте з прикладу):

```bash
cp env.example .env
```

**Основні змінні:**

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=1h

# Gateway Service Configuration
GATEWAY_PORT=4000
AUTH_SERVICE_URL=http://auth-service:3000/graphql
USER_SERVICE_URL=http://user-service:3001/graphql
WALLET_SERVICE_URL=http://wallet-service:3002/graphql
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Database Configuration
MONGO_URI_AUTH=mongodb://dev_user:dev_password@mongo-auth:27017/auth-service?authSource=admin
MONGO_URI_USERS=mongodb://dev_user:dev_password@mongo-users:27017/user-service?authSource=admin
MONGO_URI_WALLETS=mongodb://dev_user:dev_password@mongo-wallets:27017/wallet-service?authSource=admin

# Redis Configuration
REDIS_URL=redis://redis:6379

# RabbitMQ Configuration
RABBITMQ_URL=amqp://dev_user:dev_password@rabbitmq:5672/wallet_platform

# Node Environment
NODE_ENV=development
LOG_LEVEL=debug
```

## 🚀 Деплой

### Staging

```bash
# Підготовка staging образів
docker-compose -f docker-compose.staging.yml up -d
```

### Production

```bash
# Білд production образів
docker-compose -f docker-compose.prod.yml up -d
```

## 📈 Моніторинг та Спостереження

### Health Checks

Всі сервіси мають автоматичні перевірки здоров'я:

- **Gateway**: `wget http://localhost:4000/health`
- **Auth**: `wget http://localhost:3000/health`
- **User**: `wget http://localhost:3001/health`
- **Wallet**: `wget http://localhost:3002/health`

### Логи

```bash
# Всі сервіси
docker-compose -f docker-compose.dev.yml logs -f

# Фільтрування логів
docker-compose -f docker-compose.dev.yml logs -f | grep ERROR
docker-compose -f docker-compose.dev.yml logs -f auth-service | grep -i jwt
```

### Доступні інструменти моніторингу

- **Prometheus**: `http://localhost:9090` (опціонально)
- **Grafana**: `http://localhost:3000` (опціонально)
- **Jaeger**: `http://localhost:16686` (опціонально)
- **RabbitMQ Management**: `http://localhost:15672`

## 🤝 Розробка

### Внесення змін

1. Створіть feature branch
2. Внесіть зміни
3. Запустіть тести
4. Створіть Pull Request

### Code Style

- **ESLint**: Автоматична перевірка коду
- **Prettier**: Форматування коду
- **TypeScript**: Строга типізація

## 📄 Ліцензія

Private License - всі права захищені.

## 🚨 Troubleshooting

### Поширені проблеми

**1. Порт вже зайнятий**

```bash
# Перевірити що використовує порт
netstat -ano | findstr ":3000 :3001 :3002 :4000"

# Зупинити всі контейнери
docker-compose -f docker-compose.dev.yml down
```

**2. Health check fails**

```bash
# Перевірити логи сервісу
docker-compose -f docker-compose.dev.yml logs auth-service

# Перевірити чи працює endpoint
curl http://localhost:3000/health
```

**3. MongoDB connection failed**

```bash
# Перевірити статус MongoDB
docker-compose -f docker-compose.dev.yml ps mongo-auth

# Перезапустити з чистими volumes
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

**4. RabbitMQ connection issues**

```bash
# Перевірити RabbitMQ
docker-compose -f docker-compose.dev.yml logs rabbitmq

# Відкрити Management UI
http://localhost:15672 (dev_user/dev_password)
```

## 👥 Стек технологій

- **Backend**: NestJS + TypeScript
- **API**: GraphQL + Apollo Federation
- **Database**: MongoDB (окремі інстанси)
- **Message Queue**: RabbitMQ
- **Cache**: Redis
- **Infrastructure**: Docker + Docker Compose
- **Testing**: Jest + Supertest + GraphQL Playground

---

**💡 Корисні посилання:**

- [Повний посібник з тестування](docs/TESTING_GRAPHQL.md)
- [API документація](docs/API.md)
- [Docker інструкції](docs/DOCKER.md)
- [README кожного сервісу](services/) - детальна документація
