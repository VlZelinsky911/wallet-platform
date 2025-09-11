# 💰 Wallet Platform

Мікросервісна платформа для управління цифровими гаманцями з використанням NestJS, GraphQL, MongoDB та RabbitMQ.

## 🏗️ Архітектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Service  │    │  User Service   │    │ Wallet Service  │
│     (5000)      │    │     (5001)      │    │     (5002)      │
│   GraphQL API   │    │   REST API      │    │   REST API      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   RabbitMQ      │
                    │    (5672)       │
                    │   Management    │
                    │    (15672)      │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   MongoDB       │    │   MongoDB       │    │   MongoDB       │
│   Auth DB       │    │   Users DB      │    │  Wallets DB     │
│   (27017)       │    │   (27017)       │    │   (27017)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
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

# Запуск всіх сервісів
docker-compose up --build -d

# Перевірка статусу
docker ps
```

### Перевірка роботи

```bash
# Auth Service (GraphQL)
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { ping }"}'

# User Service
curl http://localhost:5001/health

# Wallet Service
curl http://localhost:5002/health

# RabbitMQ Management UI
http://localhost:15672 (admin/password)
```

## 📋 Сервіси

| Сервіс             | Порт | Технології                      | Опис                          |
| ------------------ | ---- | ------------------------------- | ----------------------------- |
| **Auth Service**   | 5000 | NestJS, GraphQL, JWT, MongoDB   | Автентифікація та авторизація |
| **User Service**   | 5001 | NestJS, REST, MongoDB, RabbitMQ | Управління користувачами      |
| **Wallet Service** | 5002 | NestJS, REST, MongoDB, RabbitMQ | Управління гаманцями          |

## 🔗 Endpoints

### Auth Service (GraphQL)

- **URL**: http://localhost:5000/graphql
- **Playground**: http://localhost:5000/graphql (у браузері)

**Приклади запитів:**

```graphql
# Ping
query {
  ping
}

# Реєстрація
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

# Вхід
mutation {
  login(input: { email: "user@example.com", password: "password123" }) {
    accessToken
    userId
    roles
  }
}
```

### User Service (REST)

- **URL**: http://localhost:5001
- **Health**: `GET /health`

### Wallet Service (REST)

- **URL**: http://localhost:5002
- **Health**: `GET /health`

## 🗄️ База даних

Проект використовує окремі MongoDB інстанси для кожного сервісу:

- **mongo-auth**: Дані автентифікації (порт 27017)
- **mongo-users**: Дані користувачів (порт 27017)
- **mongo-wallets**: Дані гаманців (порт 27017)

## 🐰 Message Queue

**RabbitMQ** для асинхронної комунікації між сервісами:

- **AMQP**: localhost:5672
- **Management UI**: http://localhost:15672
- **Credentials**: admin/password

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
# Перегляд логів
docker-compose logs -f auth-service

# Перезапуск сервісу
docker-compose restart auth-service

# Зупинка всіх сервісів
docker-compose down

# Очистка volumes (ОБЕРЕЖНО!)
docker-compose down -v

# Білд без кешу
docker-compose build --no-cache
```

## 📁 Структура проекту

```
wallet-platform/
├── docker-compose.yml           # Основна конфігурація Docker
├── README.md                   # Ця документація
├── services/
│   ├── auth-service/          # Сервіс автентифікації
│   │   ├── src/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── user-service/          # Сервіс користувачів
│   │   ├── src/
│   │   ├── test/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── wallet-service/        # Сервіс гаманців
│       ├── src/
│       ├── test/
│       ├── Dockerfile
│       └── package.json
└── docs/                      # Документація
```

## 🧪 Тестування

### Unit тести

```bash
# Всі сервіси
npm test

# Конкретний сервіс
cd services/auth-service && npm test
```

### E2E тести

```bash
# Всі сервіси
npm run test:e2e

# З coverage
npm run test:cov
```

### Integration тести

```bash
# Запуск тестового оточення
docker-compose -f docker-compose.test.yml up -d

# Запуск тестів
npm run test:integration
```

## 🔧 Конфігурація

### Змінні середовища

Створіть `.env` файл у корені проекту:

```env
# JWT
JWT_SECRET=your-super-secure-jwt-secret

# RabbitMQ
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=your-secure-password

# MongoDB
MONGO_AUTH_URI=mongodb://localhost:27017/auth
MONGO_USERS_URI=mongodb://localhost:27017/users
MONGO_WALLETS_URI=mongodb://localhost:27017/wallets
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

## 📈 Моніторинг

- **Health Checks**: Автоматичні перевірки здоров'я сервісів
- **Logs**: Централізовані логи через Docker
- **Metrics**: Готовність до інтеграції з Prometheus/Grafana

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

## 👥 Команда

- Backend: NestJS + GraphQL + MongoDB
- Message Queue: RabbitMQ
- Infrastructure: Docker + Docker Compose

---

**💡 Tip**: Для детальної документації кожного сервісу дивіться README файли у відповідних папках `services/`.
