# 📡 API Documentation

Повна документація по API endpoints для всіх сервісів Wallet Platform.

## 🌐 Base URLs

| Service             | URL                    | Type    |
| ------------------- | ---------------------- | ------- |
| Auth Service        | http://localhost:5000  | GraphQL |
| User Service        | http://localhost:5001  | REST    |
| Wallet Service      | http://localhost:5002  | REST    |
| RabbitMQ Management | http://localhost:15672 | Web UI  |

## 🔐 Auth Service (GraphQL)

### GraphQL Playground

**URL**: http://localhost:5000/graphql

### Authentication Flow

#### 1. Register User

```graphql
mutation RegisterUser {
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

**Response:**

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

#### 2. Login User

```graphql
mutation LoginUser {
  login(input: { email: "john@example.com", password: "securePassword123" }) {
    accessToken
    userId
    roles
  }
}
```

#### 3. Health Check

```graphql
query HealthCheck {
  ping
}
```

**Response:**

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

## 👤 User Service (REST)

### Base URL: http://localhost:5001

### Authentication

Всі захищені endpoints потребують JWT токен у заголовку:

```
Authorization: Bearer <jwt-token>
```

### Endpoints

#### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "ok"
}
```

#### Get User Profile

```http
GET /users/profile
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "email": "john@example.com",
  "name": "John Doe",
  "profilePicture": null,
  "phoneNumber": null,
  "preferences": {
    "language": "en",
    "currency": "USD",
    "notifications": true
  },
  "status": "active",
  "createdAt": "2023-09-01T10:00:00.000Z",
  "updatedAt": "2023-09-01T10:00:00.000Z"
}
```

#### Update User Profile

```http
PUT /users/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "John Smith",
  "phoneNumber": "+1234567890",
  "preferences": {
    "language": "uk",
    "currency": "UAH"
  }
}
```

#### Get All Users (Admin Only)

```http
GET /users
Authorization: Bearer <admin-jwt-token>
```

#### Get User by ID (Admin Only)

```http
GET /users/:id
Authorization: Bearer <admin-jwt-token>
```

## 💰 Wallet Service (REST)

### Base URL: http://localhost:5002

### Wallets

#### Create Wallet

```http
POST /wallets
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "My Main Wallet",
  "currency": "USD",
  "type": "personal"
}
```

**Response:**

```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "name": "My Main Wallet",
  "currency": "USD",
  "balance": 0,
  "type": "personal",
  "status": "active",
  "isDefault": true,
  "createdAt": "2023-09-01T10:00:00.000Z"
}
```

#### Get My Wallets

```http
GET /wallets
Authorization: Bearer <jwt-token>
```

**Response:**

```json
[
  {
    "id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "name": "My Main Wallet",
    "currency": "USD",
    "balance": 150.5,
    "type": "personal",
    "status": "active",
    "isDefault": true,
    "createdAt": "2023-09-01T10:00:00.000Z"
  }
]
```

#### Get Wallet by ID

```http
GET /wallets/:id
Authorization: Bearer <jwt-token>
```

#### Update Wallet

```http
PUT /wallets/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Updated Wallet Name"
}
```

#### Delete Wallet

```http
DELETE /wallets/:id
Authorization: Bearer <jwt-token>
```

### Balance Operations

#### Get Wallet Balance

```http
GET /wallets/:id/balance
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "walletId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "balance": 150.5,
  "currency": "USD",
  "lastUpdated": "2023-09-01T12:00:00.000Z"
}
```

#### Deposit Money

```http
POST /wallets/:id/deposit
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "amount": 100.00,
  "description": "Salary deposit",
  "reference": "SAL-2023-09-001"
}
```

**Response:**

```json
{
  "transactionId": "64f1a2b3c4d5e6f7g8h9i0j2",
  "walletId": "64f1a2b3c4d5e6f7g8h9i0j1",
  "type": "deposit",
  "amount": 100.0,
  "balanceBefore": 50.5,
  "balanceAfter": 150.5,
  "currency": "USD",
  "description": "Salary deposit",
  "status": "completed",
  "createdAt": "2023-09-01T12:00:00.000Z"
}
```

#### Withdraw Money

```http
POST /wallets/:id/withdraw
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "amount": 25.00,
  "description": "ATM withdrawal"
}
```

### Transfers

#### Transfer Between Wallets

```http
POST /wallets/:id/transfer
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "toWalletId": "64f1a2b3c4d5e6f7g8h9i0j3",
  "amount": 50.00,
  "description": "Payment to friend"
}
```

**Response:**

```json
{
  "fromTransaction": {
    "transactionId": "64f1a2b3c4d5e6f7g8h9i0j4",
    "type": "transfer_out",
    "amount": -50.0,
    "balanceAfter": 100.5
  },
  "toTransaction": {
    "transactionId": "64f1a2b3c4d5e6f7g8h9i0j5",
    "type": "transfer_in",
    "amount": 50.0,
    "balanceAfter": 75.0
  },
  "status": "completed"
}
```

### Transactions

#### Get Transaction History

```http
GET /wallets/:id/transactions?page=1&limit=10&type=deposit
Authorization: Bearer <jwt-token>
```

**Query Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `type` (optional): Transaction type filter
- `startDate` (optional): Filter from date (ISO string)
- `endDate` (optional): Filter to date (ISO string)

**Response:**

```json
{
  "transactions": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "type": "deposit",
      "amount": 100.0,
      "balanceBefore": 50.5,
      "balanceAfter": 150.5,
      "currency": "USD",
      "description": "Salary deposit",
      "status": "completed",
      "createdAt": "2023-09-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
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

## 📱 Integration Examples

### Frontend JavaScript

```javascript
class WalletPlatformAPI {
  constructor(baseURL = "http://localhost") {
    this.authService = `${baseURL}:5000/graphql`;
    this.userService = `${baseURL}:5001`;
    this.walletService = `${baseURL}:5002`;
    this.token = localStorage.getItem("jwt_token");
  }

  // Auth Service
  async login(email, password) {
    const response = await fetch(this.authService, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation Login($email: String!, $password: String!) {
            login(input: { email: $email, password: $password }) {
              accessToken
              userId
              roles
            }
          }
        `,
        variables: { email, password },
      }),
    });

    const data = await response.json();
    if (data.data?.login?.accessToken) {
      this.token = data.data.login.accessToken;
      localStorage.setItem("jwt_token", this.token);
    }
    return data;
  }

  // User Service
  async getProfile() {
    const response = await fetch(`${this.userService}/users/profile`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });
    return response.json();
  }

  // Wallet Service
  async createWallet(name, currency) {
    const response = await fetch(`${this.walletService}/wallets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, currency }),
    });
    return response.json();
  }

  async transfer(fromWalletId, toWalletId, amount, description) {
    const response = await fetch(
      `${this.walletService}/wallets/${fromWalletId}/transfer`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ toWalletId, amount, description }),
      }
    );
    return response.json();
  }
}

// Usage
const api = new WalletPlatformAPI();

// Login
await api.login("john@example.com", "password123");

// Create wallet
const wallet = await api.createWallet("My Wallet", "USD");

// Transfer money
await api.transfer(wallet.id, "other-wallet-id", 50.0, "Payment");
```

### Python Client

```python
import requests
import json

class WalletPlatformClient:
    def __init__(self, base_url="http://localhost"):
        self.auth_service = f"{base_url}:5000/graphql"
        self.user_service = f"{base_url}:5001"
        self.wallet_service = f"{base_url}:5002"
        self.token = None

    def login(self, email, password):
        query = """
        mutation Login($email: String!, $password: String!) {
            login(input: { email: $email, password: $password }) {
                accessToken
                userId
                roles
            }
        }
        """

        response = requests.post(
            self.auth_service,
            json={
                "query": query,
                "variables": {"email": email, "password": password}
            }
        )

        data = response.json()
        if data.get("data", {}).get("login", {}).get("accessToken"):
            self.token = data["data"]["login"]["accessToken"]

        return data

    def get_wallets(self):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(f"{self.wallet_service}/wallets", headers=headers)
        return response.json()

    def deposit(self, wallet_id, amount, description):
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        data = {"amount": amount, "description": description}

        response = requests.post(
            f"{self.wallet_service}/wallets/{wallet_id}/deposit",
            headers=headers,
            json=data
        )
        return response.json()

# Usage
client = WalletPlatformClient()
client.login("john@example.com", "password123")
wallets = client.get_wallets()
client.deposit(wallets[0]["id"], 100.0, "Initial deposit")
```

## 🔗 Postman Collection

Створіть Postman collection з цими endpoints для тестування API:

```json
{
  "info": {
    "name": "Wallet Platform API",
    "description": "Complete API collection for Wallet Platform"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost"
    },
    {
      "key": "jwt_token",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth Service",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "{{base_url}}:5000/graphql",
            "body": {
              "mode": "graphql",
              "graphql": {
                "query": "mutation Login($email: String!, $password: String!) {\n  login(input: { email: $email, password: $password }) {\n    accessToken\n    userId\n    roles\n  }\n}",
                "variables": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\"\n}"
              }
            }
          }
        }
      ]
    }
  ]
}
```

---

**💡 Tip**: Використовуйте GraphQL Playground для тестування Auth Service та інструменти типу Postman або Insomnia для REST API.
