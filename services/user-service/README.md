# User Service

Мікросервіс для управління користувачами в wallet-platform.

## Функціональність

- ✅ CRUD операції для користувачів
- ✅ GraphQL API
- ✅ Валідація вхідних даних з class-validator
- ✅ Інтеграція з MongoDB через @nestjs/mongoose
- ✅ Публікація событий в RabbitMQ (user.created, user.updated, user.deleted)
- ✅ Soft delete (isActive: false)

## Технології

- NestJS
- GraphQL (code-first approach)
- MongoDB
- RabbitMQ
- TypeScript

## Встановлення залежностей

```bash
npm install
```

## Конфігурація

Створіть файл `.env` в корені проекту:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/user-service

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Application
PORT=3001
NODE_ENV=development
```

## Запуск

### Development режим

```bash
npm run start:dev
```

### Production режим

```bash
npm run build
npm run start:prod
```

## GraphQL API

Після запуску сервісу GraphQL Playground буде доступний за адресою: `http://localhost:3001/graphql`

### Приклади запитів

#### Створення користувача

```graphql
mutation CreateUser {
  createUser(
    createUserInput: {
      email: "john.doe@example.com"
      firstName: "John"
      lastName: "Doe"
      phone: "+1234567890"
    }
  ) {
    id
    email
    firstName
    lastName
    phone
    isActive
    createdAt
    updatedAt
  }
}
```

#### Отримання всіх користувачів

```graphql
query GetUsers {
  users {
    id
    email
    firstName
    lastName
    phone
    isActive
    createdAt
    updatedAt
  }
}
```

#### Отримання користувача за ID

```graphql
query GetUser {
  user(id: "507f1f77bcf86cd799439011") {
    id
    email
    firstName
    lastName
    phone
    isActive
    createdAt
    updatedAt
  }
}
```

#### Пошук користувача за email

```graphql
query GetUserByEmail {
  userByEmail(email: "john.doe@example.com") {
    id
    email
    firstName
    lastName
    phone
    isActive
    createdAt
    updatedAt
  }
}
```

#### Оновлення користувача

```graphql
mutation UpdateUser {
  updateUser(
    updateUserInput: {
      id: "507f1f77bcf86cd799439011"
      firstName: "Jane"
      lastName: "Smith"
    }
  ) {
    id
    email
    firstName
    lastName
    phone
    isActive
    createdAt
    updatedAt
  }
}
```

#### Видалення користувача (soft delete)

```graphql
mutation RemoveUser {
  removeUser(id: "507f1f77bcf86cd799439011")
}
```

## События RabbitMQ

Сервіс публікує наступні події в RabbitMQ з exchange `wallet-platform`:

### user.created

```json
{
  "type": "user.created",
  "occurredAt": "2024-01-01T00:00:00.000Z",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  },
  "version": "1.0"
}
```

### user.updated

```json
{
  "type": "user.updated",
  "occurredAt": "2024-01-01T00:00:00.000Z",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "version": "1.0"
}
```

### user.deleted

```json
{
  "type": "user.deleted",
  "occurredAt": "2024-01-01T00:00:00.000Z",
  "data": {
    "userId": "507f1f77bcf86cd799439011"
  },
  "version": "1.0"
}
```

## Тестування

```bash
# Unit тести
npm run test

# E2E тести
npm run test:e2e

# Покриття тестами
npm run test:cov
```

## Структура проекту

```
src/
├── users/
│   ├── user.schema.ts      # MongoDB схема
│   ├── user.types.ts       # GraphQL типи
│   ├── user.inputs.ts      # GraphQL input типи і валідація
│   ├── user.events.ts      # RabbitMQ події
│   ├── users.service.ts    # Бізнес логіка
│   ├── users.resolver.ts   # GraphQL resolver
│   ├── users.module.ts     # NestJS модуль
│   └── users.service.spec.ts # Тести
├── messaging/
│   ├── rabbitmq.service.ts  # RabbitMQ сервіс
│   └── messaging.module.ts  # NestJS модуль
└── app.module.ts           # Головний модуль
```
