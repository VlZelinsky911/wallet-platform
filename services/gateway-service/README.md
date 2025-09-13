# Gateway Service

Apollo Federation Gateway для Wallet Platform. Цей сервіс об'єднує всі мікросервіси в єдину GraphQL схему та забезпечує:

- Apollo Federation (підключення auth-service, user-service, wallet-service)
- JWT авторизацію та передачу контексту
- Guards для protected операцій
- Мінімальну авторизацію на основі ролей

## Функціональність

### Apollo Gateway
- **Federation**: Об'єднує всі субграфи в єдину схему
- **Service Discovery**: Автоматично розпізнає схеми від субсервісів
- **Query Planning**: Оптимізує виконання запитів між сервісами

### JWT обробка
- **Token Validation**: Перевіряє JWT токени
- **Context Forwarding**: Передає користувацький контекст до субсервісів
- **Headers Propagation**: Проксує авторизаційні заголовки

### Authorization Guards
- **JwtAuthGuard**: Захищає GraphQL операції JWT токенами
- **RolesGuard**: Перевіряє ролі користувача
- **@Roles() decorator**: Для декларативного контролю доступу

## API Endpoints

- **GraphQL Playground**: `http://localhost:4000/graphql` (dev only)
- **Health Check**: `http://localhost:4000/graphql` (GET request)

## Environment Variables

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=your-secret-key
AUTH_SERVICE_URL=http://auth-service:3000/graphql
USER_SERVICE_URL=http://user-service:3001/graphql
WALLET_SERVICE_URL=http://wallet-service:3002/graphql
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Usage

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Docker
```bash
# Development
docker-compose -f docker-compose.dev.yml up gateway-service

# Production
docker-compose up gateway-service
```

## Federation Schema

Gateway автоматично створює федеровану схему з наступних субграфів:

1. **auth**: Аутентифікація та JWT токени
2. **users**: Управління користувачами
3. **wallets**: Управління гаманцями та транзакціями

## Authorization Flow

1. Клієнт надсилає запит з JWT токеном в `Authorization: Bearer <token>`
2. Gateway перевіряє токен та витягує користувацький контекст
3. Контекст передається до субсервісів через заголовки:
   - `authorization`: Оригінальний JWT токен
   - `x-user-id`: ID користувача
   - `x-user-roles`: JSON масив ролей користувача
4. Субсервіси можуть використовувати цю інформацію для авторизації

## Error Handling

Gateway обробляє помилки від субсервісів та повертає їх у стандартному GraphQL форматі.

## Monitoring

- Health checks через GraphQL endpoint
- Metrics готові для Prometheus
- Logging з рівнями за NODE_ENV
