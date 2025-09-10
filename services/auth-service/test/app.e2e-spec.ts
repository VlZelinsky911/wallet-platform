import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { AppModule } from './../src/app.module';
import { User } from './../src/users/user.schema';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

interface GraphQLResponse {
  body: {
    data?: {
      ping?: string;
      register?: {
        accessToken: string;
        userId: string;
        roles: string[];
      };
      login?: {
        accessToken: string;
        userId: string;
        roles: string[];
      };
    };
    errors?: { message: string }[];
  };
}

describe('Auth Service (e2e)', () => {
  let app: INestApplication<App>;

  // Mock користувача для тестів
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    passwordHash:
      '$2b$10$N9qo8uLOickgx2ZMRZoMye.rHxF6KMH/L7q.5cJB9XoP4M2v/.dWy', // password123
    name: 'Test User',
    roles: ['user'],
    createdAt: new Date(),
    updatedAt: new Date(),
    toObject: () => mockUser,
  };

  // Mock MongoDB Model
  const mockUserModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  // Mock MongoDB Connection
  const mockConnection = {
    close: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getModelToken(User.name))
      .useValue(mockUserModel)
      .overrideProvider(getConnectionToken())
      .useValue(mockConnection)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  beforeEach(() => {
    // Скидаємо моки перед кожним тестом
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GraphQL Ping Query', () => {
    it('should return "ok" for ping query', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            query {
              ping
            }
          `,
        })
        .expect(200)
        .expect((res: GraphQLResponse) => {
          expect(res.body.data?.ping).toBe('ok');
        });
    });
  });

  describe('User Registration', () => {
    it('should register a new user successfully', () => {
      // Налаштування моків
      const mockQuery = { lean: jest.fn().mockResolvedValue(null) };
      mockUserModel.findOne.mockReturnValue(mockQuery);
      mockUserModel.create.mockResolvedValue(mockUser);

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
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
          `,
        })
        .expect(200)
        .expect((res: GraphQLResponse) => {
          expect(res.body.data?.register).toBeDefined();
          expect(res.body.data?.register?.accessToken).toBeDefined();
          expect(res.body.data?.register?.userId).toBeDefined();
          expect(res.body.data?.register?.roles).toEqual(['user']);
        });
    });

    it('should register a user without name', () => {
      const mockQuery = { lean: jest.fn().mockResolvedValue(null) };
      mockUserModel.findOne.mockReturnValue(mockQuery);
      mockUserModel.create.mockResolvedValue(mockUser);

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              register(input: {
                email: "testnoname@example.com"
                password: "password123"
              }) {
                accessToken
                userId
                roles
              }
            }
          `,
        })
        .expect(200)
        .expect((res: GraphQLResponse) => {
          expect(res.body.data?.register).toBeDefined();
          expect(res.body.data?.register?.accessToken).toBeDefined();
          expect(res.body.data?.register?.userId).toBeDefined();
          expect(res.body.data?.register?.roles).toEqual(['user']);
        });
    });

    it('should fail with duplicate email', () => {
      // Налаштування моків - користувач існує
      const mockQuery = { lean: jest.fn().mockResolvedValue(mockUser) };
      mockUserModel.findOne.mockReturnValue(mockQuery);

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              register(input: {
                email: "test@example.com"
                password: "password123"
                name: "Another User"
              }) {
                accessToken
                userId
                roles
              }
            }
          `,
        })
        .expect(200)
        .expect((res: GraphQLResponse) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors?.[0]?.message).toBe('Email already in use');
        });
    });

    it('should fail with invalid email', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              register(input: {
                email: "invalid-email"
                password: "password123"
                name: "Test User"
              }) {
                accessToken
                userId
                roles
              }
            }
          `,
        })
        .expect(200)
        .expect((res: GraphQLResponse) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors?.[0]?.message).toBe('Bad Request Exception');
        });
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              register(input: {
                email: "shortpass@example.com"
                password: "12345"
                name: "Test User"
              }) {
                accessToken
                userId
                roles
              }
            }
          `,
        })
        .expect(200)
        .expect((res: GraphQLResponse) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors?.[0]?.message).toBe('Bad Request Exception');
        });
    });
  });

  describe('User Login', () => {
    it('should login successfully with valid credentials', () => {
      // Налаштування моків - користувач існує
      const mockQuery = { lean: jest.fn().mockResolvedValue(mockUser) };
      mockUserModel.findOne.mockReturnValue(mockQuery);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              login(input: {
                email: "test@example.com"
                password: "password123"
              }) {
                accessToken
                userId
                roles
              }
            }
          `,
        })
        .expect(200)
        .expect((res: GraphQLResponse) => {
          expect(res.body.data?.login).toBeDefined();
          expect(res.body.data?.login?.accessToken).toBeDefined();
          expect(res.body.data?.login?.userId).toBeDefined();
          expect(res.body.data?.login?.roles).toEqual(['user']);
        });
    });

    it('should fail with non-existent user', () => {
      // Налаштування моків - користувач не існує
      const mockQuery = { lean: jest.fn().mockResolvedValue(null) };
      mockUserModel.findOne.mockReturnValue(mockQuery);

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              login(input: {
                email: "nonexistent@example.com"
                password: "password123"
              }) {
                accessToken
                userId
                roles
              }
            }
          `,
        })
        .expect(200)
        .expect((res: GraphQLResponse) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors?.[0]?.message).toBe('Invalid credentials');
        });
    });

    it('should fail with wrong password', () => {
      // Налаштування моків - користувач існує (пароль буде неправильний)
      const mockQuery = { lean: jest.fn().mockResolvedValue(mockUser) };
      mockUserModel.findOne.mockReturnValue(mockQuery);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              login(input: {
                email: "test@example.com"
                password: "wrongpassword"
              }) {
                accessToken
                userId
                roles
              }
            }
          `,
        })
        .expect(200)
        .expect((res: GraphQLResponse) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors?.[0]?.message).toBe('Invalid credentials');
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              login(input: {
                email: "invalid-email"
                password: "password123"
              }) {
                accessToken
                userId
                roles
              }
            }
          `,
        })
        .expect(200)
        .expect((res: GraphQLResponse) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors?.[0]?.message).toBe('Bad Request Exception');
        });
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: `
            mutation {
              login(input: {
                email: "test@example.com"
                password: "123"
              }) {
                accessToken
                userId
                roles
              }
            }
          `,
        })
        .expect(200)
        .expect((res: GraphQLResponse) => {
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors?.[0]?.message).toBe('Bad Request Exception');
        });
    });
  });
});
