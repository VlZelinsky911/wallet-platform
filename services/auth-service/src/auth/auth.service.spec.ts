import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

// Mock bcryptjs
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    name: 'Test User',
    roles: ['user'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      createUser: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      const name = 'New User';
      const hashedPassword = 'hashedpassword123';
      const token = 'jwt.token.here';

      usersService.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      usersService.createUser.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue(token);

      const result = await service.register(email, password, name);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(usersService.createUser).toHaveBeenCalledWith(
        email,
        hashedPassword,
        name,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser._id,
        roles: mockUser.roles,
      });
      expect(result).toEqual({
        accessToken: token,
        userId: mockUser._id,
        roles: mockUser.roles,
      });
    });

    it('should register a new user without name', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      const hashedPassword = 'hashedpassword123';
      const token = 'jwt.token.here';

      usersService.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);
      usersService.createUser.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue(token);

      const result = await service.register(email, password);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(usersService.createUser).toHaveBeenCalledWith(
        email,
        hashedPassword,
        undefined,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser._id,
        roles: mockUser.roles,
      });
      expect(result).toEqual({
        accessToken: token,
        userId: mockUser._id,
        roles: mockUser.roles,
      });
    });

    it('should throw UnauthorizedException if email already exists', async () => {
      const email = 'existing@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(mockUser);

      await expect(service.register(email, password)).rejects.toThrow(
        new UnauthorizedException('Email already in use'),
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.hash).not.toHaveBeenCalled();
      expect(usersService.createUser).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle bcrypt hash errors', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      const error = new Error('Hash failed');

      usersService.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockRejectedValue(error as never);

      await expect(service.register(email, password)).rejects.toThrow(error);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(usersService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const token = 'jwt.token.here';

      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue(token);

      const result = await service.login(email, password);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        password,
        mockUser.passwordHash,
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser._id,
        roles: mockUser.roles,
      });
      expect(result).toEqual({
        accessToken: token,
        userId: mockUser._id,
        roles: mockUser.roles,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      usersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(email, password)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(email, password)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        password,
        mockUser.passwordHash,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should handle bcrypt compare errors', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const error = new Error('Compare failed');

      usersService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockRejectedValue(error as never);

      await expect(service.login(email, password)).rejects.toThrow(error);

      expect(usersService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        password,
        mockUser.passwordHash,
      );
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });
});
