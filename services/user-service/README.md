# 👤 User Service

Сервіс управління користувачами для Wallet Platform. Забезпечує REST API для операцій з профілями користувачів та інтеграцію з RabbitMQ для асинхронної комунікації.

## 🎯 Основний функціонал

- **Управління профілями** користувачів
- **REST API** для CRUD операцій
- **RabbitMQ integration** для event-driven архітектури
- **MongoDB** для зберігання даних користувачів
- **JWT авторизація** через Auth Service

## 🚀 Швидкий старт

### Локальний запуск

```bash
# Встановлення залежностей
npm install

# Встановлення змінних середовища
export MONGO_URI_USERS=mongodb://localhost:27017/users
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
docker-compose up user-service -d

# Або локальний білд
docker build -t user-service .
docker run -p 5001:5001 user-service
```

## 📡 REST API

### Base URL

- **URL**: http://localhost:5001

### Endpoints

#### Health Check

```http
GET /health
```

**Відповідь:**

```json
{
  "status": "ok"
}
```

#### Отримати профіль користувача

```http
GET /users/profile
Authorization: Bearer <jwt-token>
```

**Відповідь:**

```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "email": "john@example.com",
  "name": "John Doe",
  "createdAt": "2023-09-01T10:00:00.000Z",
  "updatedAt": "2023-09-01T10:00:00.000Z"
}
```

#### Оновити профіль

```http
PUT /users/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "John Smith",
  "email": "john.smith@example.com"
}
```

#### Отримати всіх користувачів (Admin)

```http
GET /users
Authorization: Bearer <admin-jwt-token>
```

#### Отримати користувача за ID (Admin)

```http
GET /users/:id
Authorization: Bearer <admin-jwt-token>
```

## 🔧 Приклади використання

### cURL команди

```bash
# Health check
curl http://localhost:5001/health

# Отримати профіль
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:5001/users/profile

# Оновити профіль
curl -X PUT \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "New Name"}' \
     http://localhost:5001/users/profile
```

### JavaScript/TypeScript

```typescript
// Клієнт для User Service
class UserServiceClient {
  private baseURL = 'http://localhost:5001';

  async getProfile(token: string) {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.json();
  }

  async updateProfile(token: string, data: any) {
    const response = await fetch(`${this.baseURL}/users/profile`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }
}
```

## 🗃️ База даних

### MongoDB Schema

```typescript
// User Document
{
  _id: ObjectId,
  email: string,           // Унікальний email
  name: string,           // Ім'я користувача
  profilePicture?: string, // URL до аватара
  phoneNumber?: string,    // Телефон
  address?: {             // Адреса
    street: string,
    city: string,
    country: string,
    postalCode: string
  },
  preferences?: {         // Налаштування
    language: string,
    currency: string,
    notifications: boolean
  },
  status: string,         // "active" | "inactive" | "suspended"
  lastLoginAt?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Індекси

```javascript
// Унікальний індекс на email
db.users.createIndex({ email: 1 }, { unique: true });

// Індекс на статус
db.users.createIndex({ status: 1 });

// Compound індекс для пошуку
db.users.createIndex({ name: 'text', email: 'text' });
```

## 🐰 RabbitMQ Integration

### Events

#### User Created

```json
{
  "type": "user.created",
  "occurredAt": "2023-09-01T10:00:00.000Z",
  "data": {
    "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### User Updated

```json
{
  "type": "user.updated",
  "occurredAt": "2023-09-01T10:00:00.000Z",
  "data": {
    "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
    "changes": {
      "name": "John Smith"
    }
  }
}
```

#### User Deleted

```json
{
  "type": "user.deleted",
  "occurredAt": "2023-09-01T10:00:00.000Z",
  "data": {
    "userId": "64f1a2b3c4d5e6f7g8h9i0j1"
  }
}
```

### Queues та Exchanges

```typescript
// Exchange configuration
const EXCHANGE_NAME = 'wallet.platform';
const ROUTING_KEYS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
};

// Queue bindings
await channel.assertExchange(EXCHANGE_NAME, 'topic');
await channel.assertQueue('user.events');
await channel.bindQueue('user.events', EXCHANGE_NAME, 'user.*');
```

## 🔐 Авторизація

### JWT Middleware

```typescript
// Перевірка JWT токена
@UseGuards(JwtAuthGuard)
@Get('profile')
async getProfile(@Request() req) {
  return this.usersService.findById(req.user.id);
}
```

### Роль-based авторизація

```typescript
// Тільки для admin
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Get()
async getAllUsers() {
  return this.usersService.findAll();
}
```

## 🧪 Тестування

### Unit тести

```bash
# Запуск всіх тестів
npm test

# З watch режимом
npm run test:watch

# З coverage
npm run test:cov
```

### E2E тести

```bash
# Запуск e2e тестів
npm run test:e2e
```

### Тестові дані

```json
{
  "testUser": {
    "email": "test@example.com",
    "name": "Test User",
    "status": "active"
  }
}
```

## ⚙️ Конфігурація

### Змінні середовища

```bash
# MongoDB
MONGO_URI_USERS=mongodb://localhost:27017/users

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Auth Service
AUTH_SERVICE_URL=http://localhost:5000

# Server
PORT=5001
NODE_ENV=development|production|test

# Logging
LOG_LEVEL=debug|info|warn|error
```

### NestJS модулі

```typescript
@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI_USERS),
    RabbitMQModule.forRoot({
      uri: process.env.RABBITMQ_URL,
    }),
    UsersModule,
  ],
})
export class AppModule {}
```

## 📊 Логування та моніторинг

### Логи

```typescript
// Приклади логів
[LOG] Starting Nest application...
[LOG] UsersModule dependencies initialized
[LOG] Connected to MongoDB
[LOG] Connected to RabbitMQ
[LOG] Nest application successfully started
```

### Health Check

```bash
# Health endpoint
curl http://localhost:5001/health

# Детальна перевірка
curl http://localhost:5001/health/detailed
```

### Metrics

- Database connection status
- RabbitMQ connection health
- API response times
- Error rates

## 🔄 Інтеграція з іншими сервісами

### Auth Service

```typescript
// Перевірка JWT токена
async validateToken(token: string) {
  const response = await this.httpService.post(
    `${this.authServiceUrl}/auth/validate`,
    { token }
  );
  return response.data;
}
```

### Wallet Service

```typescript
// Відправка події створення користувача
await this.rabbitMQService.publish('wallet.platform', 'user.created', {
  type: 'user.created',
  occurredAt: new Date(),
  data: { userId, email, name },
});
```

## 🚀 Deployment

### Docker

```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx nest build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/dist dist
COPY package*.json ./
RUN npm ci --omit=dev
EXPOSE 5001
CMD ["node","dist/main.js"]
```

### Health Checks

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:5001/health']
  interval: 30s
  timeout: 10s
  retries: 3
```

## 🐛 Troubleshooting

### Поширені проблеми

1. **MongoDB connection error**

   ```bash
   # Перевірте підключення
   docker ps | grep mongo-users
   echo $MONGO_URI_USERS
   ```

2. **RabbitMQ connection failed**

   ```bash
   # Перевірте RabbitMQ
   docker ps | grep rabbitmq
   curl http://localhost:15672
   ```

3. **Auth validation failed**
   ```bash
   # Перевірте Auth Service
   curl http://localhost:5000/health
   ```

### Debugging

```bash
# Debug режим
npm run start:debug

# Логи з Docker
docker-compose logs -f user-service
```

## 📝 TODO

- [ ] File upload для profile pictures
- [ ] Advanced пошук користувачів
- [ ] User activity logging
- [ ] Email notifications
- [ ] Social media integration
- [ ] User preferences management

---

**🔗 Зв'язані сервіси:**

- [Auth Service](../auth-service/README.md)
- [Wallet Service](../wallet-service/README.md)
