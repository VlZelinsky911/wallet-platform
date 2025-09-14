# Тестування всіх сервісів через GraphQL Playground

Цей посібник описує як протестувати всі 3 сервіси (auth-service, user-service, wallet-service) через єдиний GraphQL Playground на `http://localhost:4000/graphql`.

## Підготовка

### 1. Запуск всіх сервісів

```bash
# Переконайтеся що у вас є .env файл
cp env.example .env

# Запустіть всі сервіси через Docker Compose
docker-compose -f docker-compose.dev.yml up

# Або запустіть окремо
docker-compose -f docker-compose.dev.yml up gateway-service auth-service user-service wallet-service
```

### 2. Перевірка доступності

Перевірте що всі сервіси працюють:

- **Gateway**: http://localhost:4000/graphql
- **Auth Service**: http://localhost:3000/health
- **User Service**: http://localhost:3001/health
- **Wallet Service**: http://localhost:3002/health

### 3. Відкрийте GraphQL Playground

Перейдіть на `http://localhost:4000/graphql` - ви повинні побачити об'єднану схему з усіх сервісів.

## Тестування Auth Service

### 1. Реєстрація користувача

```graphql
mutation Register {
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
```

### 2. Логін користувача

```graphql
mutation Login {
  login(input: { email: "test@example.com", password: "password123" }) {
    accessToken
    userId
    roles
  }
}
```

### 3. Ping (перевірка доступності)

```graphql
query {
  ping
}
```

**Важливо**: Збережіть `accessToken` з відповіді - він знадобиться для авторизованих запитів!

## Тестування User Service

### 1. Створення користувача

```graphql
mutation CreateUser {
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
    phone
    isActive
    createdAt
    updatedAt
  }
}
```

### 2. Отримання всіх користувачів

```graphql
query GetAllUsers {
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

### 3. Отримання користувача за ID

```graphql
query GetUser {
  user(id: "USER_ID_HERE") {
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

### 4. Отримання користувача за email

```graphql
query GetUserByEmail {
  userByEmail(email: "user@example.com") {
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

### 5. Оновлення користувача

```graphql
mutation UpdateUser {
  updateUser(
    updateUserInput: {
      id: "USER_ID_HERE"
      firstName: "Jane"
      lastName: "Smith"
      phone: "+0987654321"
      isActive: true
    }
  ) {
    id
    email
    firstName
    lastName
    phone
    isActive
    updatedAt
  }
}
```

### 6. Видалення користувача

```graphql
mutation RemoveUser {
  removeUser(id: "USER_ID_HERE")
}
```

## Тестування Wallet Service

### 1. Створення гаманця

```graphql
mutation CreateWallet {
  createWallet(createWalletInput: { userId: "USER_ID_HERE", currency: USD }) {
    id
    userId
    walletNumber
    balance
    currency
    status
    createdAt
    updatedAt
  }
}
```

### 2. Отримання всіх гаманців

```graphql
query GetAllWallets {
  wallets {
    id
    userId
    walletNumber
    balance
    currency
    status
    blockedAt
    blockedReason
    createdAt
    updatedAt
  }
}
```

### 3. Отримання гаманця за ID

```graphql
query GetWallet {
  wallet(id: "WALLET_ID_HERE") {
    id
    userId
    walletNumber
    balance
    currency
    status
    blockedAt
    blockedReason
    createdAt
    updatedAt
  }
}
```

### 4. Поповнення гаманця

```graphql
mutation TopUpWallet {
  topUpWallet(
    topUpInput: {
      walletId: "WALLET_ID_HERE"
      amount: 100.50
      description: "Test top-up"
    }
  ) {
    id
    balance
    updatedAt
  }
}
```

### 5. Переказ між гаманцями

```graphql
mutation TransferBetweenWallets {
  transferBetweenWallets(
    transferInput: {
      fromWalletId: "FROM_WALLET_ID"
      toWalletId: "TO_WALLET_ID"
      amount: 50.00
      description: "Test transfer"
    }
  ) {
    id
    type
    amount
    description
    status
    createdAt
  }
}
```

### 6. Оновлення статусу гаманця

```graphql
mutation UpdateWallet {
  updateWallet(
    updateWalletInput: {
      id: "WALLET_ID_HERE"
      status: BLOCKED
      blockedReason: "Suspicious activity"
    }
  ) {
    id
    status
    blockedAt
    blockedReason
    updatedAt
  }
}
```

## Авторизовані запити

Для запитів, що потребують авторизації, додайте JWT токен в заголовки:

1. Внизу GraphQL Playground натисніть "HTTP HEADERS"
2. Додайте заголовок:

```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

## Приклад повного тестового сценарію

### Крок 1: Реєстрація та логін

```graphql
# 1. Реєстрація
mutation {
  register(
    input: {
      email: "testuser@example.com"
      password: "password123"
      name: "Test User"
    }
  ) {
    accessToken
    userId
    roles
  }
}
```

### Крок 2: Створення профілю користувача

```graphql
# 2. Створення користувача (використайте userId з попереднього кроку)
mutation {
  createUser(
    createUserInput: {
      email: "testuser@example.com"
      firstName: "Test"
      lastName: "User"
      phone: "+1234567890"
    }
  ) {
    id
    email
    firstName
    lastName
  }
}
```

### Крок 3: Створення гаманця

```graphql
# 3. Створення гаманця (використайте userId)
mutation {
  createWallet(
    createWalletInput: { userId: "USER_ID_FROM_STEP_1", currency: USD }
  ) {
    id
    userId
    walletNumber
    balance
    currency
    status
  }
}
```

### Крок 4: Поповнення гаманця

```graphql
# 4. Поповнення гаманця
mutation {
  topUpWallet(
    topUpInput: {
      walletId: "WALLET_ID_FROM_STEP_3"
      amount: 1000.00
      description: "Initial deposit"
    }
  ) {
    id
    balance
  }
}
```

## Доступні типи та енуми

### Currency (Валюта)

- `USD` - US Dollar
- `EUR` - Euro
- `UAH` - Ukrainian Hryvnia

### WalletStatus (Статус гаманця)

- `ACTIVE` - Активний
- `BLOCKED` - Заблокований
- `SUSPENDED` - Призупинений

### TransactionType (Тип транзакції)

- `TOP_UP` - Поповнення
- `TRANSFER` - Переказ
- `WITHDRAWAL` - Зняття

### TransactionStatus (Статус транзакції)

- `PENDING` - В очікуванні
- `COMPLETED` - Завершена
- `FAILED` - Невдала

## Помилки та їх вирішення

### 1. "Cannot query field" помилка

- Перевірте що всі сервіси запущені
- Перевірте що Gateway може підключитися до субсервісів

### 2. "Unauthorized" помилка

- Переконайтеся що додали правильний JWT токен в заголовки
- Перевірте що токен не застарів

### 3. "Service unavailable" помилка

- Перевірте логи сервісів: `docker-compose logs service-name`
- Перевірте що MongoDB та RabbitMQ працюють

### 4. Federation помилки

- Перевірте що всі сервіси мають правильні `@key` директиви
- Перевірте що типи правильно експортуються між сервісами

## Моніторинг та логи

Для перегляду логів:

```bash
# Всі сервіси
docker-compose -f docker-compose.dev.yml logs -f

# Окремий сервіс
docker-compose -f docker-compose.dev.yml logs -f gateway-service
docker-compose -f docker-compose.dev.yml logs -f auth-service
docker-compose -f docker-compose.dev.yml logs -f user-service
docker-compose -f docker-compose.dev.yml logs -f wallet-service
```

## Корисні запити для дебагінгу

### Introspection запит (для перегляду схеми)

```graphql
query IntrospectionQuery {
  __schema {
    types {
      name
      kind
      fields {
        name
        type {
          name
          kind
        }
      }
    }
  }
}
```

### Перевірка Federation

```graphql
query {
  _service {
    sdl
  }
}
```

Цей посібник допоможе вам повністю протестувати всі функції вашої wallet platform через єдиний GraphQL endpoint!
