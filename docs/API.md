# 📡 API Documentation

Повна документація по API endpoints для всіх сервісів Wallet Platform з Apollo Federation.

## 🌐 Base URLs

| Service             | URL                    | Type    | Description                            |
| ------------------- | ---------------------- | ------- | -------------------------------------- |
| **Gateway Service** | http://localhost:4000  | GraphQL | **Головний API (використовуйте цей!)** |
| Auth Service        | http://localhost:3000  | GraphQL | Прямий доступ (для розробки)           |
| User Service        | http://localhost:3001  | GraphQL | Прямий доступ (для розробки)           |
| Wallet Service      | http://localhost:3002  | GraphQL | Прямий доступ (для розробки)           |
| RabbitMQ Management | http://localhost:15672 | Web UI  | Управління чергами повідомлень         |

## 🌟 Gateway Service - Головний API

**URL**: http://localhost:4000/graphql  
**Playground**: http://localhost:4000/graphql (у браузері)

### Особливості

- **Apollo Federation** - автоматично об'єднує всі GraphQL схеми
- **Єдина точка входу** для всіх операцій
- **JWT авторизація** з автоматичною передачею контексту
- **Introspection** та **Playground** в development режимі
- **Оптимізація запитів** між сервісами

## 🔐 Автентифікація та авторизація

Всі операції автентифікації виконуються через Gateway Service.

### 1. Реєстрація користувача

```graphql
mutation Register {
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

### 2. Авторизація

```graphql
mutation Login {
  login(input: { email: "john@example.com", password: "securePassword123" }) {
    accessToken
    userId
    roles
  }
}
```

### 3. Ping перевірка

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

### Error Handling

#### Validation Error

```json
{
  "errors": [
    {
      "message": "Bad Request Exception",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["register"],
      "extensions": {
        "code": "BAD_USER_INPUT",
        "exception": {
          "validationErrors": [
            {
              "field": "email",
              "message": "email must be a valid email"
            }
          ]
        }
      }
    }
  ]
}
```

#### Business Logic Error

```json
{
  "errors": [
    {
      "message": "Email already in use",
      "locations": [{ "line": 2, "column": 3 }],
      "path": ["register"]
    }
  ]
}
```

## 👤 Управління користувачами

### Авторизація для захищених операцій

Додайте JWT токен в HTTP заголовки GraphQL Playground:

```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN_HERE"
}
```

### 1. Створення користувача

```graphql
mutation CreateUser {
  createUser(
    createUserInput: {
      email: "john@example.com"
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

### 4. Пошук користувача за email

```graphql
query GetUserByEmail {
  userByEmail(email: "john@example.com") {
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

## 💰 Управління гаманцями та транзакціями

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
    blockedAt
    blockedReason
    createdAt
    updatedAt
  }
}
```

**Доступні валюти**: `USD`, `EUR`, `UAH`  
**Статуси**: `ACTIVE`, `BLOCKED`, `SUSPENDED`

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
      description: "Salary deposit"
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
      description: "Payment to friend"
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

**Типи транзакцій**: `TOP_UP`, `TRANSFER`, `WITHDRAWAL`  
**Статуси транзакцій**: `PENDING`, `COMPLETED`, `FAILED`

### 6. Оновлення статусу гаманця

```graphql
mutation UpdateWallet {
  updateWallet(
    updateWalletInput: {
      id: "WALLET_ID_HERE"
      status: BLOCKED
      blockedReason: "Suspicious activity detected"
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

### 7. Отримання транзакцій гаманця

```graphql
query GetWalletTransactions {
  wallet(id: "WALLET_ID_HERE") {
    id
    walletNumber
    balance
    transactions {
      id
      type
      amount
      description
      status
      createdAt
    }
  }
}
```

## 🔒 Error Responses

### Standard Error Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details",
    "timestamp": "2023-09-01T12:00:00.000Z",
    "path": "/api/endpoint",
    "traceId": "uuid-trace-id"
  }
}
```

### Common HTTP Status Codes

| Code | Meaning               | Description                               |
| ---- | --------------------- | ----------------------------------------- |
| 200  | OK                    | Successful request                        |
| 201  | Created               | Resource created successfully             |
| 400  | Bad Request           | Invalid request data                      |
| 401  | Unauthorized          | Authentication required                   |
| 403  | Forbidden             | Insufficient permissions                  |
| 404  | Not Found             | Resource not found                        |
| 409  | Conflict              | Resource conflict (e.g., duplicate email) |
| 422  | Unprocessable Entity  | Validation failed                         |
| 429  | Too Many Requests     | Rate limit exceeded                       |
| 500  | Internal Server Error | Server error                              |

### Business Logic Errors

#### Insufficient Funds

```json
{
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Insufficient funds in wallet",
    "details": {
      "walletId": "64f1a2b3c4d5e6f7g8h9i0j1",
      "currentBalance": 25.0,
      "requestedAmount": 50.0,
      "currency": "USD"
    }
  }
}
```

#### Wallet Not Found

```json
{
  "error": {
    "code": "WALLET_NOT_FOUND",
    "message": "Wallet not found or access denied",
    "details": {
      "walletId": "64f1a2b3c4d5e6f7g8h9i0j1"
    }
  }
}
```

## 📱 Приклади інтеграції

### Frontend JavaScript (Apollo Client)

```javascript
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { gql } from "@apollo/client";

class WalletPlatformAPI {
  constructor(gatewayURL = "http://localhost:4000/graphql") {
    // HTTP Link до Gateway Service
    const httpLink = createHttpLink({
      uri: gatewayURL,
    });

    // Auth Link для додавання JWT токена
    const authLink = setContext((_, { headers }) => {
      const token = localStorage.getItem("jwt_token");
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : "",
        },
      };
    });

    // Apollo Client
    this.client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
    });
  }

  // Авторизація
  async login(email, password) {
    const LOGIN_MUTATION = gql`
      mutation Login($email: String!, $password: String!) {
        login(input: { email: $email, password: $password }) {
          accessToken
          userId
          roles
        }
      }
    `;

    const { data } = await this.client.mutate({
      mutation: LOGIN_MUTATION,
      variables: { email, password },
    });

    if (data.login.accessToken) {
      localStorage.setItem("jwt_token", data.login.accessToken);
    }

    return data.login;
  }

  // Створення користувача
  async createUser(email, firstName, lastName, phone) {
    const CREATE_USER_MUTATION = gql`
      mutation CreateUser($input: CreateUserInput!) {
        createUser(createUserInput: $input) {
          id
          email
          firstName
          lastName
          phone
          isActive
        }
      }
    `;

    const { data } = await this.client.mutate({
      mutation: CREATE_USER_MUTATION,
      variables: {
        input: { email, firstName, lastName, phone },
      },
    });

    return data.createUser;
  }

  // Створення гаманця
  async createWallet(userId, currency = "USD") {
    const CREATE_WALLET_MUTATION = gql`
      mutation CreateWallet($input: CreateWalletInput!) {
        createWallet(createWalletInput: $input) {
          id
          userId
          walletNumber
          balance
          currency
          status
        }
      }
    `;

    const { data } = await this.client.mutate({
      mutation: CREATE_WALLET_MUTATION,
      variables: {
        input: { userId, currency },
      },
    });

    return data.createWallet;
  }

  // Поповнення гаманця
  async topUpWallet(walletId, amount, description) {
    const TOP_UP_MUTATION = gql`
      mutation TopUpWallet($input: TopUpInput!) {
        topUpWallet(topUpInput: $input) {
          id
          balance
          updatedAt
        }
      }
    `;

    const { data } = await this.client.mutate({
      mutation: TOP_UP_MUTATION,
      variables: {
        input: { walletId, amount, description },
      },
    });

    return data.topUpWallet;
  }

  // Переказ між гаманцями
  async transfer(fromWalletId, toWalletId, amount, description) {
    const TRANSFER_MUTATION = gql`
      mutation TransferBetweenWallets($input: TransferInput!) {
        transferBetweenWallets(transferInput: $input) {
          id
          type
          amount
          description
          status
          createdAt
        }
      }
    `;

    const { data } = await this.client.mutate({
      mutation: TRANSFER_MUTATION,
      variables: {
        input: { fromWalletId, toWalletId, amount, description },
      },
    });

    return data.transferBetweenWallets;
  }

  // Отримання гаманців користувача
  async getWallets() {
    const GET_WALLETS_QUERY = gql`
      query GetWallets {
        wallets {
          id
          userId
          walletNumber
          balance
          currency
          status
          createdAt
        }
      }
    `;

    const { data } = await this.client.query({
      query: GET_WALLETS_QUERY,
    });

    return data.wallets;
  }
}

// Використання
const api = new WalletPlatformAPI();

async function example() {
  try {
    // 1. Авторизація
    const authResult = await api.login("john@example.com", "password123");
    console.log("Logged in:", authResult);

    // 2. Створення користувача
    const user = await api.createUser(
      "john@example.com",
      "John",
      "Doe",
      "+1234567890"
    );
    console.log("User created:", user);

    // 3. Створення гаманця
    const wallet = await api.createWallet(authResult.userId, "USD");
    console.log("Wallet created:", wallet);

    // 4. Поповнення гаманця
    const topUp = await api.topUpWallet(wallet.id, 1000.0, "Initial deposit");
    console.log("Wallet topped up:", topUp);

    // 5. Отримання всіх гаманців
    const wallets = await api.getWallets();
    console.log("All wallets:", wallets);
  } catch (error) {
    console.error("Error:", error);
  }
}

example();
```

### TypeScript/Node.js Client (GraphQL-Request)

```typescript
import { GraphQLClient, gql } from "graphql-request";

interface AuthResult {
  accessToken: string;
  userId: string;
  roles: string[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

interface Wallet {
  id: string;
  userId: string;
  walletNumber: string;
  balance: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description?: string;
  status: string;
  createdAt: string;
}

export class WalletPlatformClient {
  private client: GraphQLClient;
  private token: string | null = null;

  constructor(gatewayUrl = "http://localhost:4000/graphql") {
    this.client = new GraphQLClient(gatewayUrl);
  }

  private setAuthToken(token: string): void {
    this.token = token;
    this.client.setHeaders({
      authorization: `Bearer ${token}`,
    });
  }

  // Авторизація
  async login(email: string, password: string): Promise<AuthResult> {
    const mutation = gql`
      mutation Login($email: String!, $password: String!) {
        login(input: { email: $email, password: $password }) {
          accessToken
          userId
          roles
        }
      }
    `;

    const data = await this.client.request(mutation, { email, password });
    const authResult = data.login as AuthResult;

    if (authResult.accessToken) {
      this.setAuthToken(authResult.accessToken);
    }

    return authResult;
  }

  // Реєстрація
  async register(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthResult> {
    const mutation = gql`
      mutation Register($input: RegisterInput!) {
        register(input: $input) {
          accessToken
          userId
          roles
        }
      }
    `;

    const data = await this.client.request(mutation, {
      input: { email, password, name },
    });

    const authResult = data.register as AuthResult;

    if (authResult.accessToken) {
      this.setAuthToken(authResult.accessToken);
    }

    return authResult;
  }

  // Створення користувача
  async createUser(
    email: string,
    firstName: string,
    lastName: string,
    phone?: string
  ): Promise<User> {
    const mutation = gql`
      mutation CreateUser($input: CreateUserInput!) {
        createUser(createUserInput: $input) {
          id
          email
          firstName
          lastName
          phone
          isActive
          createdAt
        }
      }
    `;

    const data = await this.client.request(mutation, {
      input: { email, firstName, lastName, phone },
    });

    return data.createUser as User;
  }

  // Отримання користувачів
  async getUsers(): Promise<User[]> {
    const query = gql`
      query GetUsers {
        users {
          id
          email
          firstName
          lastName
          phone
          isActive
          createdAt
        }
      }
    `;

    const data = await this.client.request(query);
    return data.users as User[];
  }

  // Отримання користувача за ID
  async getUserById(id: string): Promise<User> {
    const query = gql`
      query GetUser($id: String!) {
        user(id: $id) {
          id
          email
          firstName
          lastName
          phone
          isActive
          createdAt
        }
      }
    `;

    const data = await this.client.request(query, { id });
    return data.user as User;
  }

  // Створення гаманця
  async createWallet(userId: string, currency = "USD"): Promise<Wallet> {
    const mutation = gql`
      mutation CreateWallet($input: CreateWalletInput!) {
        createWallet(createWalletInput: $input) {
          id
          userId
          walletNumber
          balance
          currency
          status
          createdAt
        }
      }
    `;

    const data = await this.client.request(mutation, {
      input: { userId, currency },
    });

    return data.createWallet as Wallet;
  }

  // Отримання всіх гаманців
  async getWallets(): Promise<Wallet[]> {
    const query = gql`
      query GetWallets {
        wallets {
          id
          userId
          walletNumber
          balance
          currency
          status
          createdAt
        }
      }
    `;

    const data = await this.client.request(query);
    return data.wallets as Wallet[];
  }

  // Отримання гаманця за ID
  async getWalletById(id: string): Promise<Wallet> {
    const query = gql`
      query GetWallet($id: String!) {
        wallet(id: $id) {
          id
          userId
          walletNumber
          balance
          currency
          status
          createdAt
        }
      }
    `;

    const data = await this.client.request(query, { id });
    return data.wallet as Wallet;
  }

  // Поповнення гаманця
  async topUpWallet(
    walletId: string,
    amount: number,
    description?: string
  ): Promise<Wallet> {
    const mutation = gql`
      mutation TopUpWallet($input: TopUpInput!) {
        topUpWallet(topUpInput: $input) {
          id
          balance
          updatedAt
        }
      }
    `;

    const data = await this.client.request(mutation, {
      input: { walletId, amount, description },
    });

    return data.topUpWallet as Wallet;
  }

  // Переказ між гаманцями
  async transferBetweenWallets(
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    description?: string
  ): Promise<Transaction> {
    const mutation = gql`
      mutation TransferBetweenWallets($input: TransferInput!) {
        transferBetweenWallets(transferInput: $input) {
          id
          type
          amount
          description
          status
          createdAt
        }
      }
    `;

    const data = await this.client.request(mutation, {
      input: { fromWalletId, toWalletId, amount, description },
    });

    return data.transferBetweenWallets as Transaction;
  }

  // Оновлення статусу гаманця
  async updateWallet(
    id: string,
    status?: string,
    blockedReason?: string
  ): Promise<Wallet> {
    const mutation = gql`
      mutation UpdateWallet($input: UpdateWalletInput!) {
        updateWallet(updateWalletInput: $input) {
          id
          status
          blockedAt
          blockedReason
          updatedAt
        }
      }
    `;

    const data = await this.client.request(mutation, {
      input: { id, status, blockedReason },
    });

    return data.updateWallet as Wallet;
  }
}

// Використання
async function example() {
  const client = new WalletPlatformClient();

  try {
    // 1. Реєстрація або авторизація
    const authResult = await client.login("john@example.com", "password123");
    console.log("Logged in:", authResult);

    // 2. Створення користувача
    const user = await client.createUser(
      "john@example.com",
      "John",
      "Doe",
      "+1234567890"
    );
    console.log("User created:", user);

    // 3. Створення гаманця
    const wallet = await client.createWallet(authResult.userId, "USD");
    console.log("Wallet created:", wallet);

    // 4. Поповнення гаманця
    const topUpResult = await client.topUpWallet(
      wallet.id,
      1000.0,
      "Initial deposit"
    );
    console.log("Wallet topped up:", topUpResult);

    // 5. Отримання всіх гаманців
    const wallets = await client.getWallets();
    console.log("All wallets:", wallets);

    // 6. Переказ між гаманцями (якщо є два гаманці)
    if (wallets.length >= 2) {
      const transferResult = await client.transferBetweenWallets(
        wallets[0].id,
        wallets[1].id,
        100.0,
        "Test transfer"
      );
      console.log("Transfer completed:", transferResult);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Запуск прикладу
example();
```

### Встановлення залежностей

```bash
# Для TypeScript проекту
npm install graphql-request graphql

# Для розробки
npm install -D @types/node typescript ts-node
```

### package.json

```json
{
  "name": "wallet-platform-client",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node example.ts",
    "build": "tsc",
    "start": "node dist/example.js"
  },
  "dependencies": {
    "graphql": "^16.8.1",
    "graphql-request": "^6.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.2.2"
  }
}
```

## 🔗 Інструменти для тестування

### GraphQL Playground (Рекомендовано)

**URL**: http://localhost:4000/graphql

Найкращий спосіб тестування - використовуйте вбудований GraphQL Playground:

- Автоматична документація всіх операцій
- Introspection схеми
- Автокомпліт та валідація
- Історія запитів
- Можливість додавання HTTP заголовків

### Postman Collection

Створіть Postman collection для GraphQL тестування:

```json
{
  "info": {
    "name": "Wallet Platform GraphQL API",
    "description": "Complete GraphQL API collection через Gateway Service"
  },
  "variable": [
    {
      "key": "gateway_url",
      "value": "http://localhost:4000/graphql"
    },
    {
      "key": "jwt_token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{gateway_url}}",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"query\": \"mutation Login($email: String!, $password: String!) { login(input: { email: $email, password: $password }) { accessToken userId roles } }\",\n  \"variables\": {\n    \"email\": \"john@example.com\",\n    \"password\": \"password123\"\n  }\n}"
            }
          }
        },
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{gateway_url}}",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"query\": \"mutation Register($input: RegisterInput!) { register(input: $input) { accessToken userId roles } }\",\n  \"variables\": {\n    \"input\": {\n      \"email\": \"john@example.com\",\n      \"password\": \"password123\",\n      \"name\": \"John Doe\"\n    }\n  }\n}"
            }
          }
        }
      ]
    },
    {
      "name": "User Management",
      "item": [
        {
          "name": "Create User",
          "request": {
            "method": "POST",
            "url": "{{gateway_url}}",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"query\": \"mutation CreateUser($input: CreateUserInput!) { createUser(createUserInput: $input) { id email firstName lastName phone isActive } }\",\n  \"variables\": {\n    \"input\": {\n      \"email\": \"john@example.com\",\n      \"firstName\": \"John\",\n      \"lastName\": \"Doe\",\n      \"phone\": \"+1234567890\"\n    }\n  }\n}"
            }
          }
        }
      ]
    },
    {
      "name": "Wallet Management",
      "item": [
        {
          "name": "Create Wallet",
          "request": {
            "method": "POST",
            "url": "{{gateway_url}}",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"query\": \"mutation CreateWallet($input: CreateWalletInput!) { createWallet(createWalletInput: $input) { id userId walletNumber balance currency status } }\",\n  \"variables\": {\n    \"input\": {\n      \"userId\": \"USER_ID_HERE\",\n      \"currency\": \"USD\"\n    }\n  }\n}"
            }
          }
        },
        {
          "name": "Top Up Wallet",
          "request": {
            "method": "POST",
            "url": "{{gateway_url}}",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"query\": \"mutation TopUpWallet($input: TopUpInput!) { topUpWallet(topUpInput: $input) { id balance updatedAt } }\",\n  \"variables\": {\n    \"input\": {\n      \"walletId\": \"WALLET_ID_HERE\",\n      \"amount\": 100.0,\n      \"description\": \"Test deposit\"\n    }\n  }\n}"
            }
          }
        }
      ]
    }
  ]
}
```

### cURL приклади

```bash
# Авторизація
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation Login($email: String!, $password: String!) { login(input: { email: $email, password: $password }) { accessToken userId roles } }",
    "variables": {
      "email": "john@example.com",
      "password": "password123"
    }
  }'

# Створення користувача (з JWT токеном)
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "query": "mutation CreateUser($input: CreateUserInput!) { createUser(createUserInput: $input) { id email firstName lastName } }",
    "variables": {
      "input": {
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  }'
```

---

## 📚 Додаткові ресурси

### Документація

- **[Повний посібник з тестування](TESTING_GRAPHQL.md)** - детальні інструкції з тестування
- **[Docker інструкції](DOCKER.md)** - налаштування та запуск через Docker
- **[README проекту](../README.md)** - загальна інформація про проект

### GraphQL ресурси

- [GraphQL офіційна документація](https://graphql.org/)
- [Apollo Federation документація](https://www.apollographql.com/docs/federation/)
- [Apollo Client документація](https://www.apollographql.com/docs/react/)

### Інструменти розробки

- **GraphQL Playground**: http://localhost:4000/graphql
- **RabbitMQ Management**: http://localhost:15672
- **Prometheus** (опціонально): http://localhost:9090
- **Grafana** (опціонально): http://localhost:3000

---

**💡 Рекомендація**: Для швидкого тестування використовуйте GraphQL Playground. Для автоматизованого тестування - Apollo Client або Python/JavaScript клієнти з цієї документації.
