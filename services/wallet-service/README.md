# 💰 Wallet Service

Сервіс управління цифровими гаманцями для Wallet Platform. Забезпечує REST API для операцій з гаманцями, балансами та транзакціями з інтеграцією RabbitMQ.

## 🎯 Основний функціонал

- **Управління гаманцями** користувачів
- **Транзакційні операції** (поповнення, списання, переказ)
- **Балансові операції** з підтримкою множинних валют
- **REST API** для всіх wallet операцій
- **RabbitMQ integration** для асинхронної обробки
- **MongoDB** для зберігання даних гаманців
- **JWT авторизація** через Auth Service

## 🚀 Швидкий старт

### Локальний запуск

```bash
# Встановлення залежностей
npm install

# Встановлення змінних середовища
export MONGO_URI_WALLETS=mongodb://localhost:27017/wallets
export RABBITMQ_URL=amqp://localhost:5672
export AUTH_SERVICE_URL=http://localhost:5000

# Запуск у режимі розробки
npm run start:dev

# Запуск у production режимі
npm run start:prod
```

### Docker запуск

```bash
# З основного проекту
docker-compose up wallet-service -d

# Або локальний білд
docker build -t wallet-service .
docker run -p 5002:5002 wallet-service
```

## 📡 REST API

### Base URL

- **URL**: http://localhost:5002

### Endpoints

#### Health Check

```http
GET /health
```

#### Гаманці

##### Створити гаманець

```http
POST /wallets
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "My Main Wallet",
  "currency": "USD"
}
```

##### Отримати мої гаманці

```http
GET /wallets
Authorization: Bearer <jwt-token>
```

##### Отримати гаманець за ID

```http
GET /wallets/:id
Authorization: Bearer <jwt-token>
```

##### Оновити гаманець

```http
PUT /wallets/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Updated Wallet Name"
}
```

##### Видалити гаманець

```http
DELETE /wallets/:id
Authorization: Bearer <jwt-token>
```

#### Баланси

##### Отримати баланс гаманця

```http
GET /wallets/:id/balance
Authorization: Bearer <jwt-token>
```

##### Поповнити баланс

```http
POST /wallets/:id/deposit
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "amount": 100.50,
  "description": "Deposit from bank card"
}
```

##### Списати з балансу

```http
POST /wallets/:id/withdraw
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "amount": 50.25,
  "description": "Payment for services"
}
```

#### Транзакції

##### Історія транзакцій

```http
GET /wallets/:id/transactions?page=1&limit=10
Authorization: Bearer <jwt-token>
```

##### Переказ між гаманцями

```http
POST /wallets/:id/transfer
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "toWalletId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "amount": 25.00,
  "description": "Transfer to friend"
}
```

## 🔧 Приклади використання

### cURL команди

```bash
# Створити гаманець
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "My Wallet", "currency": "USD"}' \
     http://localhost:5002/wallets

# Поповнити баланс
curl -X POST \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"amount": 100, "description": "Initial deposit"}' \
     http://localhost:5002/wallets/WALLET_ID/deposit

# Отримати баланс
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5002/wallets/WALLET_ID/balance
```

### JavaScript/TypeScript

```typescript
class WalletServiceClient {
  private baseURL = 'http://localhost:5002';

  async createWallet(token: string, data: any) {
    const response = await fetch(`${this.baseURL}/wallets`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async getBalance(token: string, walletId: string) {
    const response = await fetch(
      `${this.baseURL}/wallets/${walletId}/balance`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.json();
  }

  async transfer(token: string, fromWalletId: string, data: any) {
    const response = await fetch(
      `${this.baseURL}/wallets/${fromWalletId}/transfer`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );
    return response.json();
  }
}
```

## 🗃️ База даних

### MongoDB Schemas

#### Wallet Document

```typescript
{
  _id: ObjectId,
  userId: ObjectId,         // Reference to user
  name: string,            // Wallet name
  currency: string,        // "USD", "EUR", "BTC", etc.
  balance: number,         // Current balance
  status: string,          // "active" | "frozen" | "closed"
  type: string,           // "personal" | "business" | "savings"
  isDefault: boolean,      // Default wallet for user
  createdAt: Date,
  updatedAt: Date
}
```

#### Transaction Document

```typescript
{
  _id: ObjectId,
  walletId: ObjectId,      // Reference to wallet
  userId: ObjectId,        // Reference to user
  type: string,           // "deposit" | "withdraw" | "transfer_in" | "transfer_out"
  amount: number,         // Transaction amount
  balanceBefore: number,  // Balance before transaction
  balanceAfter: number,   // Balance after transaction
  currency: string,       // Transaction currency
  description: string,    // Transaction description
  reference?: string,     // External reference
  relatedWalletId?: ObjectId, // For transfers
  relatedTransactionId?: ObjectId, // For transfers
  status: string,         // "pending" | "completed" | "failed" | "cancelled"
  metadata?: object,      // Additional transaction data
  createdAt: Date,
  updatedAt: Date
}
```

### Індекси

```javascript
// Wallet indices
db.wallets.createIndex({ userId: 1 });
db.wallets.createIndex({ userId: 1, isDefault: 1 });
db.wallets.createIndex({ status: 1 });

// Transaction indices
db.transactions.createIndex({ walletId: 1, createdAt: -1 });
db.transactions.createIndex({ userId: 1, createdAt: -1 });
db.transactions.createIndex({ type: 1 });
db.transactions.createIndex({ status: 1 });
```

## 🐰 RabbitMQ Integration

### Events

#### Wallet Created

```json
{
  "type": "wallet.created",
  "occurredAt": "2023-09-01T10:00:00.000Z",
  "data": {
    "walletId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "userId": "64f1a2b3c4d5e6f7g8h9i0j2",
    "name": "My Wallet",
    "currency": "USD"
  }
}
```

#### Transaction Completed

```json
{
  "type": "transaction.completed",
  "occurredAt": "2023-09-01T10:00:00.000Z",
  "data": {
    "transactionId": "64f1a2b3c4d5e6f7g8h9i0j3",
    "walletId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "userId": "64f1a2b3c4d5e6f7g8h9i0j2",
    "type": "deposit",
    "amount": 100.0,
    "currency": "USD",
    "newBalance": 100.0
  }
}
```

#### Balance Updated

```json
{
  "type": "balance.updated",
  "occurredAt": "2023-09-01T10:00:00.000Z",
  "data": {
    "walletId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "userId": "64f1a2b3c4d5e6f7g8h9i0j2",
    "previousBalance": 50.0,
    "newBalance": 100.0,
    "currency": "USD"
  }
}
```

## 💸 Бізнес логіка

### Транзакційна безпека

```typescript
// Atomic transaction example
async transfer(fromWalletId: string, toWalletId: string, amount: number) {
  const session = await this.connection.startSession();

  try {
    await session.withTransaction(async () => {
      // 1. Перевірити баланс
      const fromWallet = await this.findWallet(fromWalletId, session);
      if (fromWallet.balance < amount) {
        throw new InsufficientFundsException();
      }

      // 2. Списати з відправника
      await this.updateBalance(fromWalletId, -amount, session);

      // 3. Зарахувати отримувачу
      await this.updateBalance(toWalletId, amount, session);

      // 4. Створити записи транзакцій
      await this.createTransactionPair(fromWalletId, toWalletId, amount, session);

      // 5. Відправити події
      await this.publishTransferEvents(fromWalletId, toWalletId, amount);
    });
  } finally {
    await session.endSession();
  }
}
```

### Валідація операцій

```typescript
class TransactionValidator {
  validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new InvalidAmountException('Amount must be positive');
    }
    if (amount > MAX_TRANSACTION_AMOUNT) {
      throw new InvalidAmountException('Amount exceeds maximum limit');
    }
  }

  async validateWalletAccess(walletId: string, userId: string): Promise<void> {
    const wallet = await this.walletsService.findOne(walletId);
    if (wallet.userId !== userId) {
      throw new UnauthorizedException('Access denied to wallet');
    }
    if (wallet.status !== 'active') {
      throw new WalletNotActiveException('Wallet is not active');
    }
  }
}
```

## 🔐 Безпека

### Авторизація

```typescript
@UseGuards(JwtAuthGuard, WalletOwnershipGuard)
@Post(':id/deposit')
async deposit(@Param('id') walletId: string, @Body() data: DepositDto) {
  return this.walletsService.deposit(walletId, data);
}
```

### Лімітування

```typescript
class TransactionLimits {
  static readonly DAILY_LIMIT = 10000; // $10,000 per day
  static readonly MONTHLY_LIMIT = 50000; // $50,000 per month
  static readonly MIN_AMOUNT = 0.01; // $0.01 minimum
  static readonly MAX_AMOUNT = 10000; // $10,000 per transaction
}
```

## 🧪 Тестування

### Unit тести

```bash
npm test
npm run test:watch
npm run test:cov
```

### Integration тести

```bash
npm run test:e2e
```

### Тестові сценарії

```typescript
describe('Wallet Service', () => {
  it('should create wallet successfully', async () => {
    const wallet = await service.createWallet(userId, {
      name: 'Test Wallet',
      currency: 'USD',
    });
    expect(wallet.balance).toBe(0);
  });

  it('should handle transfer between wallets', async () => {
    await service.deposit(fromWalletId, { amount: 100 });
    await service.transfer(fromWalletId, toWalletId, { amount: 50 });

    const fromBalance = await service.getBalance(fromWalletId);
    const toBalance = await service.getBalance(toWalletId);

    expect(fromBalance).toBe(50);
    expect(toBalance).toBe(50);
  });
});
```

## ⚙️ Конфігурація

### Змінні середовища

```bash
# MongoDB
MONGO_URI_WALLETS=mongodb://localhost:27017/wallets

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Auth Service
AUTH_SERVICE_URL=http://localhost:5000

# Business Rules
MAX_WALLETS_PER_USER=10
DEFAULT_CURRENCY=USD
TRANSACTION_FEE_PERCENTAGE=0.001

# Server
PORT=5002
NODE_ENV=development|production|test
```

## 📊 Моніторинг

### Metrics

- Total wallets count
- Transaction volume (daily/monthly)
- Average transaction amount
- Failed transaction rate
- Balance distribution

### Health Checks

```typescript
@Get('health')
async healthCheck() {
  return {
    status: 'ok',
    database: await this.checkDatabaseHealth(),
    rabbitmq: await this.checkRabbitMQHealth(),
    timestamp: new Date().toISOString()
  };
}
```

## 🚀 Deployment

### Production конфігурація

```yaml
# docker-compose.prod.yml
wallet-service:
  build:
    context: ./services/wallet-service
    dockerfile: Dockerfile.prod
  environment:
    - NODE_ENV=production
    - MONGO_URI_WALLETS=${MONGO_URI_WALLETS}
    - RABBITMQ_URL=${RABBITMQ_URL}
  deploy:
    replicas: 3
    resources:
      limits:
        memory: 512M
        cpus: '0.5'
```

## 🐛 Troubleshooting

### Поширені проблеми

1. **Insufficient funds error**

   ```bash
   # Перевірте баланс гаманця
   curl -H "Authorization: Bearer TOKEN" \
        http://localhost:5002/wallets/ID/balance
   ```

2. **Transaction timeout**

   ```bash
   # Перевірте статус транзакції
   curl -H "Authorization: Bearer TOKEN" \
        http://localhost:5002/wallets/ID/transactions
   ```

3. **Database lock issues**
   ```bash
   # Перевірте активні сесії MongoDB
   db.currentOp()
   ```

## 📝 Roadmap

- [ ] Multi-currency support з автоконвертацією
- [ ] Recurring transactions (підписки)
- [ ] Transaction categories та budgeting
- [ ] Integration з external payment providers
- [ ] Wallet sharing між користувачами
- [ ] Advanced analytics та reporting
- [ ] Mobile push notifications
- [ ] Blockchain integration

---

**🔗 Зв'язані сервіси:**

- [Auth Service](../auth-service/README.md)
- [User Service](../user-service/README.md)
