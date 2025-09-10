import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { RegisterInput, LoginInput } from './auth.inputs';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: jest.Mocked<AuthService>;

  const mockAuthPayload = {
    accessToken: 'jwt.token.here',
    userId: '507f1f77bcf86cd799439011',
    roles: ['user'],
  };

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthResolver,
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('ping', () => {
    it('should return "ok"', () => {
      const result = resolver.ping();
      expect(result).toBe('ok');
    });
  });

  describe('register', () => {
    it('should register a user successfully', async () => {
      const input: RegisterInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      authService.register.mockResolvedValue(mockAuthPayload);

      const result = await resolver.register(input);

      expect(authService.register).toHaveBeenCalledWith(
        input.email,
        input.password,
        input.name,
      );
      expect(result).toEqual(mockAuthPayload);
    });

    it('should register a user without name', async () => {
      const input: RegisterInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      authService.register.mockResolvedValue(mockAuthPayload);

      const result = await resolver.register(input);

      expect(authService.register).toHaveBeenCalledWith(
        input.email,
        input.password,
        input.name,
      );
      expect(result).toEqual(mockAuthPayload);
    });

    it('should throw UnauthorizedException when email is already in use', async () => {
      const input: RegisterInput = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const error = new UnauthorizedException('Email already in use');
      authService.register.mockRejectedValue(error);

      await expect(resolver.register(input)).rejects.toThrow(error);
      expect(authService.register).toHaveBeenCalledWith(
        input.email,
        input.password,
        input.name,
      );
    });

    it('should handle service errors during registration', async () => {
      const input: RegisterInput = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const error = new Error('Database connection failed');
      authService.register.mockRejectedValue(error);

      await expect(resolver.register(input)).rejects.toThrow(error);
      expect(authService.register).toHaveBeenCalledWith(
        input.email,
        input.password,
        input.name,
      );
    });
  });

  describe('login', () => {
    it('should login a user successfully', async () => {
      const input: LoginInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      authService.login.mockResolvedValue(mockAuthPayload);

      const result = await resolver.login(input);

      expect(authService.login).toHaveBeenCalledWith(
        input.email,
        input.password,
      );
      expect(result).toEqual(mockAuthPayload);
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const input: LoginInput = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new UnauthorizedException('Invalid credentials');
      authService.login.mockRejectedValue(error);

      await expect(resolver.login(input)).rejects.toThrow(error);
      expect(authService.login).toHaveBeenCalledWith(
        input.email,
        input.password,
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const input: LoginInput = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const error = new UnauthorizedException('Invalid credentials');
      authService.login.mockRejectedValue(error);

      await expect(resolver.login(input)).rejects.toThrow(error);
      expect(authService.login).toHaveBeenCalledWith(
        input.email,
        input.password,
      );
    });

    it('should handle service errors during login', async () => {
      const input: LoginInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      const error = new Error('Database connection failed');
      authService.login.mockRejectedValue(error);

      await expect(resolver.login(input)).rejects.toThrow(error);
      expect(authService.login).toHaveBeenCalledWith(
        input.email,
        input.password,
      );
    });
  });
});
