# Testing Apollo Gateway

## Запуск системи

### 1. Налаштування змінних середовища
```bash
# В root директорії проекту створіть .env файл:
cp env.example .env

# Встановіть JWT_SECRET
# JWT_SECRET=your-super-secret-jwt-key-here-make-it-very-long-and-secure
```

### 2. Запуск через Docker Compose
```bash
# Development режим
docker-compose -f docker-compose.dev.yml up

# Або тільки gateway і залежності
docker-compose -f docker-compose.dev.yml up gateway-service
```

### 3. Перевірка що все працює
```bash
# Перевірити health endpoints
curl http://localhost:3000/graphql  # auth-service
curl http://localhost:3001/graphql  # user-service  
curl http://localhost:3002/graphql  # wallet-service
curl http://localhost:4000/graphql  # gateway-service
```

## Тестування Federation

### 1. Відкрийте GraphQL Playground
Перейдіть на `http://localhost:4000/graphql`

### 2. Перевірте федеровану схему
```graphql
# Переглянути схему в Playground
# Ви повинні побачити типи з усіх сервісів

query IntrospectionQuery {
  __schema {
    types {
      name
      kind
    }
  }
}
```

### 3. Тестові запити

#### Створення користувача (auth-service)
```graphql
mutation Register {
  register(input: {
    email: "test@example.com"
    password: "password123"
    name: "Test User"
  }) {
    accessToken
    userId
    roles
  }
}
```

#### Логін (auth-service)
```graphql
mutation Login {
  login(input: {
    email: "test@example.com"
    password: "password123"
  }) {
    accessToken
    userId
    roles
  }
}
```

#### Створення профілю користувача (user-service)
```graphql
# З JWT токеном в Headers: {"Authorization": "Bearer <token>"}
mutation CreateUser {
  createUser(createUserInput: {
    email: "test@example.com"
    firstName: "Test"
    lastName: "User"
    phone: "+380123456789"
  }) {
    id
    email
    firstName
    lastName
    isActive
  }
}
```

#### Створення гаманця (wallet-service)
```graphql
# З JWT токеном в Headers: {"Authorization": "Bearer <token>"}
mutation CreateWallet {
  createWallet(createWalletInput: {
    userId: "<user_id_from_previous_query>"
    currency: USD
  }) {
    id
    userId
    walletNumber
    balance
    currency
    status
  }
}
```

#### Федерований запит (через gateway)
```graphql
# Отримати дані користувача з різних сервісів одним запитом
query UserWithWallets {
  user(id: "<user_id>") {
    id
    email
    firstName
    lastName
    # Це поле має резолвитися через wallet-service
    wallets {
      id
      balance
      currency
      status
    }
  }
}
```

## Тестування Authorization

### 1. Публічні endpoint'и
```graphql
# Без токена
query Public {
  ping  # auth-service
}
```

### 2. Protected endpoint'и
```graphql
# З токеном в Headers
# Headers: {"Authorization": "Bearer <jwt_token>"}
query Protected {
  users {
    id
    email
    firstName
  }
}
```

### 3. Role-based endpoint'и
```graphql
# Тільки для admin ролі
# Headers: {"Authorization": "Bearer <admin_jwt_token>"}
mutation AdminOnly {
  # адмін операції
}
```

## Налагодження

### 1. Перевірка логів
```bash
# Gateway logs
docker-compose -f docker-compose.dev.yml logs gateway-service

# Субсервіси
docker-compose -f docker-compose.dev.yml logs auth-service
docker-compose -f docker-compose.dev.yml logs user-service
docker-compose -f docker-compose.dev.yml logs wallet-service
```

### 2. Типові помилки

#### Subgraph недоступний
```
Error: Failed to load subgraph schema from http://auth-service:3000/graphql
```
**Рішення**: Перевірте що сервіс запущений та доступний

#### JWT помилки
```
Error: jwt must be provided
Error: jwt malformed
```
**Рішення**: Перевірте що токен передається в правильному форматі

#### Federation помилки
```
Error: Field "wallets" argument "id" of type "ID!" is required
```
**Рішення**: Перевірте що всі субграфи мають правильні `@key` директиви

### 3. Корисні команди
```bash
# Перезапуск тільки gateway
docker-compose -f docker-compose.dev.yml restart gateway-service

# Очистка volumes
docker-compose -f docker-compose.dev.yml down -v

# Перебудова образів
docker-compose -f docker-compose.dev.yml up --build
```
