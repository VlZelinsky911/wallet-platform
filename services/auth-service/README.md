# 🔐 Auth Service

Сервіс автентифікації та авторизації для Wallet Platform. Використовує GraphQL API для взаємодії з клієнтами.

## 🎯 Основний функціонал

- **Реєстрація користувачів** з валідацією email та пароля
- **Автентифікація** через JWT токени
- **Авторизація** на основі ролей користувачів
- **GraphQL API** з Apollo Server
- **MongoDB** для зберігання даних користувачів

## 🚀 Швидкий старт

### Локальний запуск

```bash
# Встановлення залежностей
npm install

# Запуск MongoDB (або використовуйте Docker)
# mongod --port 27017

# Встановлення змінних середовища
export MONGO_URI_AUTH=mongodb://localhost:27017/auth
export JWT_SECRET=your-secret-key

# Запуск у режимі розробки
npm run start:dev

# Запуск у production режимі
npm run start:prod
```

### Docker запуск

```bash
# З основного проекту
docker-compose up auth-service -d

# Або локальний білд
docker build -t auth-service .
docker run -p 5000:5000 auth-service
```

## 📡 GraphQL API

### Endpoint

- **URL**: http://localhost:5000/graphql
- **Playground**: Доступний в браузері для testing

### Schema

#### Queries

```graphql
type Query {
  # Перевірка доступності сервісу
  ping: String!
}
```

#### Mutations

```graphql
type Mutation {
  # Реєстрація нового користувача
  register(input: RegisterInput!): AuthResponse!

  # Вхід користувача
  login(input: LoginInput!): AuthResponse!
}
```

#### Types

```graphql
# Вхідні дані для реєстрації
input RegisterInput {
  email: String! # Валідний email
  password: String! # Мінімум 6 символів
  name: String # Опціональне ім'я
}

# Вхідні дані для входу
input LoginInput {
  email: String!
  password: String!
}

# Відповідь після автентифікації
type AuthResponse {
  accessToken: String! # JWT токен
  userId: String! # ID користувача
  roles: [String!]! # Ролі користувача
}
```

## 🔧 Приклади запитів

### Ping

```graphql
query {
  ping
}
```

**Відповідь:**

```json
{
  "data": {
    "ping": "ok"
  }
}
```

### Реєстрація

```graphql
mutation {
  register(
    input: {
      email: "john@example.com"
      password: "securePassword123"
      name: "John Doe"
    }
  ) {
    accessToken
    userId
    roles
  }
}
```

**Відповідь:**

```json
{
  "data": {
    "register": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "userId": "64f1a2b3c4d5e6f7g8h9i0j1",
      "roles": ["user"]
    }
  }
}
```

### Вхід

```graphql
mutation {
  login(input: { email: "john@example.com", password: "securePassword123" }) {
    accessToken
    userId
    roles
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
  passwordHash: string,    // Bcrypt хеш пароля
  name?: string,          // Опціональне ім'я
  roles: string[],        // Масив ролей ["user", "admin", ...]
  createdAt: Date,
  updatedAt: Date
}
```

### Індекси

```javascript
// Унікальний індекс на email
db.users.createIndex({ email: 1 }, { unique: true });

// Індекс на ролі для швидкого пошуку
db.users.createIndex({ roles: 1 });
```

## 🔐 Безпека

### JWT Токени

- **Алгоритм**: HS256
- **Термін дії**: Configurable (за замовчуванням: 24 години)
- **Payload**: userId, email, roles

### Паролі

- **Хешування**: bcrypt з salt rounds = 10
- **Валідація**: Мінімум 6 символів
- **Політика**: Рекомендується використовувати складні паролі

### Валідація

- **Email**: Валідний email формат
- **Вхідні дані**: class-validator decorators
- **GraphQL**: Автоматична валідація schema

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

# З coverage
npm run test:e2e:cov
```

### Тестові дані

```graphql
# Тестовий користувач
{
  "email": "test@example.com",
  "password": "password123",
  "name": "Test User"
}
```

## ⚙️ Конфігурація

### Змінні середовища

```bash
# MongoDB
MONGO_URI_AUTH=mongodb://localhost:27017/auth

# JWT
JWT_SECRET=your-super-secure-secret-key

# Server
PORT=5000
NODE_ENV=development|production|test

# Logging
LOG_LEVEL=debug|info|warn|error
```

### GraphQL налаштування

```typescript
GraphQLModule.forRoot<ApolloDriverConfig>({
  driver: ApolloDriver,
  autoSchemaFile: true, // Автогенерація schema
  playground: true, // GraphQL Playground
  introspection: true, // Introspection queries
  csrfPrevention: false, // CSRF захист
});
```

## 📊 Логування та моніторинг

### Логи

```typescript
// Приклади логів
[LOG] Starting Nest application...
[LOG] GraphQLModule dependencies initialized
[LOG] Nest application successfully started
```

### Health Check

```bash
# Endpoint для перевірки здоров'я
curl http://localhost:5000/health

# Відповідь
{"status": "ok"}
```

### Metrics

- Готовість до інтеграції з Prometheus
- GraphQL query metrics
- Database connection health

## 🔄 Інтеграція з іншими сервісами

### User Service

- Передача JWT токена у заголовках
- Валідація токена для авторизації

### Wallet Service

- Аналогічна авторизація через JWT
- Роль-based доступ до ресурсів

## 🚀 Deployment

### Docker

```dockerfile
# Multi-stage build для оптимізації
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
EXPOSE 5000
CMD ["node","dist/main.js"]
```

### Health Checks

```yaml
healthcheck:
  test: ['CMD', 'curl', '-f', 'http://localhost:5000/health']
  interval: 30s
  timeout: 10s
  retries: 3
```

## 🐛 Troubleshooting

### Поширені проблеми

1. **MongoDB connection error**

   ```bash
   # Перевірте чи запущений MongoDB
   docker ps | grep mongo

   # Перевірте змінну середовища
   echo $MONGO_URI_AUTH
   ```

2. **JWT secret not set**

   ```bash
   # Встановіть JWT_SECRET
   export JWT_SECRET=your-secret-key
   ```

3. **GraphQL playground не працює**
   ```typescript
   // Переконайтесь що playground увімкнений
   playground: true,
   introspection: true,
   ```

### Debugging

```bash
# Запуск з debug mode
npm run start:debug

# Логи з Docker
docker-compose logs -f auth-service
```

## 📝 TODO

- [ ] Refresh токени
- [ ] OAuth інтеграція (Google, Facebook)
- [ ] Rate limiting
- [ ] Account verification через email
- [ ] Password reset функціональність
- [ ] 2FA authentication

---

**🔗 Зв'язані сервіси:**

- [User Service](../user-service/README.md)
- [Wallet Service](../wallet-service/README.md)
