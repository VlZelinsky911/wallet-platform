import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Query } from 'mongoose';
import { UsersService } from './users.service';
import { User, UserDocument, UserDoc } from './user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: jest.Mocked<Model<UserDocument>>;

  const mockUser: UserDoc = {
    _id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    name: 'Test User',
    roles: ['user'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
  };

  const mockUserDocument = {
    ...mockUser,
    toObject: jest.fn().mockReturnValue(mockUser),
  };

  beforeEach(async () => {
    const mockModel = {
      findOne: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const email = 'test@example.com';
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(mockUser),
      } as unknown as Query<UserDoc | null, UserDocument>;

      userModel.findOne.mockReturnValue(mockQuery);

      const result = await service.findByEmail(email);

      expect(userModel.findOne).toHaveBeenCalledWith({ email });
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      const email = 'nonexistent@example.com';
      const mockQuery = {
        lean: jest.fn().mockResolvedValue(null),
      } as unknown as Query<UserDoc | null, UserDocument>;

      userModel.findOne.mockReturnValue(mockQuery);

      const result = await service.findByEmail(email);

      expect(userModel.findOne).toHaveBeenCalledWith({ email });
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const email = 'test@example.com';
      const error = new Error('Database connection failed');
      const mockQuery = {
        lean: jest.fn().mockRejectedValue(error),
      } as unknown as Query<UserDoc | null, UserDocument>;

      userModel.findOne.mockReturnValue(mockQuery);

      await expect(service.findByEmail(email)).rejects.toThrow(error);
      expect(userModel.findOne).toHaveBeenCalledWith({ email });
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const email = 'newuser@example.com';
      const passwordHash = 'hashedpassword123';
      const name = 'New User';

      userModel.create.mockResolvedValue(mockUserDocument as any);

      const result = await service.createUser(email, passwordHash, name);

      expect(userModel.create).toHaveBeenCalledWith({
        email,
        passwordHash,
        name,
        roles: ['user'],
      });
      expect(mockUserDocument.toObject).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should create a new user without name', async () => {
      const email = 'newuser@example.com';
      const passwordHash = 'hashedpassword123';

      userModel.create.mockResolvedValue(mockUserDocument as any);

      const result = await service.createUser(email, passwordHash);

      expect(userModel.create).toHaveBeenCalledWith({
        email,
        passwordHash,
        name: undefined,
        roles: ['user'],
      });
      expect(mockUserDocument.toObject).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should handle duplicate email error', async () => {
      const email = 'existing@example.com';
      const passwordHash = 'hashedpassword123';
      const name = 'New User';

      const duplicateError = new Error(
        'E11000 duplicate key error',
      ) as Error & { code: number };
      duplicateError.code = 11000;

      userModel.create.mockRejectedValue(duplicateError);

      await expect(
        service.createUser(email, passwordHash, name),
      ).rejects.toThrow(duplicateError);
      expect(userModel.create).toHaveBeenCalledWith({
        email,
        passwordHash,
        name,
        roles: ['user'],
      });
    });

    it('should handle database connection errors', async () => {
      const email = 'newuser@example.com';
      const passwordHash = 'hashedpassword123';
      const name = 'New User';

      const error = new Error('Database connection failed');
      userModel.create.mockRejectedValue(error);

      await expect(
        service.createUser(email, passwordHash, name),
      ).rejects.toThrow(error);
      expect(userModel.create).toHaveBeenCalledWith({
        email,
        passwordHash,
        name,
        roles: ['user'],
      });
    });

    it('should handle validation errors', async () => {
      const email = 'invalid-email';
      const passwordHash = 'hashedpassword123';
      const name = 'New User';

      const validationError = new Error('Validation failed') as Error & {
        name: string;
      };
      validationError.name = 'ValidationError';

      userModel.create.mockRejectedValue(validationError);

      await expect(
        service.createUser(email, passwordHash, name),
      ).rejects.toThrow(validationError);
      expect(userModel.create).toHaveBeenCalledWith({
        email,
        passwordHash,
        name,
        roles: ['user'],
      });
    });
  });
});
