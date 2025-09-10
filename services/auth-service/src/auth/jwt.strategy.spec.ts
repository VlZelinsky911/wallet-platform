import { JwtStrategy } from './jwt.strategy';
import type { JwtPayload } from './types/jwt-payload';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  const originalEnv = process.env;

  beforeEach(() => {
    // Відновлюємо змінні середовища перед кожним тестом
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Відновлюємо оригінальні змінні середовища після всіх тестів
    process.env = originalEnv;
  });

  describe('Constructor', () => {
    it('should create strategy with valid JWT_SECRET', () => {
      // Arrange
      process.env.JWT_SECRET = 'test-secret-key';

      // Act & Assert
      expect(() => {
        jwtStrategy = new JwtStrategy();
      }).not.toThrow();
      expect(jwtStrategy).toBeDefined();
      expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
    });

    it('should throw error when JWT_SECRET is not set', () => {
      // Arrange
      delete process.env.JWT_SECRET;

      // Act & Assert
      expect(() => {
        jwtStrategy = new JwtStrategy();
      }).toThrow(
        'JWT_SECRET is not set. Please configure environment variable JWT_SECRET.',
      );
    });

    it('should throw error when JWT_SECRET is empty string', () => {
      // Arrange
      process.env.JWT_SECRET = '';

      // Act & Assert
      expect(() => {
        jwtStrategy = new JwtStrategy();
      }).toThrow(
        'JWT_SECRET is not set. Please configure environment variable JWT_SECRET.',
      );
    });

    it('should throw error when JWT_SECRET is only whitespace', () => {
      // Arrange
      process.env.JWT_SECRET = '   ';

      // Act & Assert
      expect(() => {
        jwtStrategy = new JwtStrategy();
      }).toThrow(
        'JWT_SECRET is not set. Please configure environment variable JWT_SECRET.',
      );
    });

    it('should throw error when JWT_SECRET is null', () => {
      // Arrange
      process.env.JWT_SECRET = null as unknown as string;

      // Act & Assert
      expect(() => {
        jwtStrategy = new JwtStrategy();
      }).toThrow(
        'JWT_SECRET is not set. Please configure environment variable JWT_SECRET.',
      );
    });
  });

  describe('Validate Method', () => {
    beforeEach(() => {
      process.env.JWT_SECRET = 'test-secret-key';
      jwtStrategy = new JwtStrategy();
    });

    it('should validate JWT payload and return user info', () => {
      // Arrange
      const mockPayload: JwtPayload = {
        sub: 'user-123',
        roles: ['user', 'admin'],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };

      // Act
      const result = jwtStrategy.validate(mockPayload);

      // Assert
      expect(result).toEqual({
        userId: 'user-123',
        roles: ['user', 'admin'],
      });
    });

    it('should validate JWT payload with minimal required fields', () => {
      // Arrange
      const mockPayload: JwtPayload = {
        sub: 'user-456',
        roles: ['user'],
      };

      // Act
      const result = jwtStrategy.validate(mockPayload);

      // Assert
      expect(result).toEqual({
        userId: 'user-456',
        roles: ['user'],
      });
    });

    it('should validate JWT payload with empty roles array', () => {
      // Arrange
      const mockPayload: JwtPayload = {
        sub: 'user-789',
        roles: [],
      };

      // Act
      const result = jwtStrategy.validate(mockPayload);

      // Assert
      expect(result).toEqual({
        userId: 'user-789',
        roles: [],
      });
    });

    it('should validate JWT payload with multiple roles', () => {
      // Arrange
      const mockPayload: JwtPayload = {
        sub: 'admin-001',
        roles: ['user', 'admin', 'moderator', 'super-admin'],
      };

      // Act
      const result = jwtStrategy.validate(mockPayload);

      // Assert
      expect(result).toEqual({
        userId: 'admin-001',
        roles: ['user', 'admin', 'moderator', 'super-admin'],
      });
    });

    it('should validate JWT payload with numeric user ID', () => {
      // Arrange
      const mockPayload: JwtPayload = {
        sub: '12345',
        roles: ['user'],
      };

      // Act
      const result = jwtStrategy.validate(mockPayload);

      // Assert
      expect(result).toEqual({
        userId: '12345',
        roles: ['user'],
      });
    });

    it('should validate JWT payload with UUID user ID', () => {
      // Arrange
      const mockPayload: JwtPayload = {
        sub: '550e8400-e29b-41d4-a716-446655440000',
        roles: ['user', 'premium'],
      };

      // Act
      const result = jwtStrategy.validate(mockPayload);

      // Assert
      expect(result).toEqual({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        roles: ['user', 'premium'],
      });
    });

    it('should ignore optional JWT fields (iat, exp)', () => {
      // Arrange
      const mockPayload: JwtPayload = {
        sub: 'user-with-timestamps',
        roles: ['user'],
        iat: 1609459200, // 2021-01-01 00:00:00 UTC
        exp: 1609545600, // 2021-01-02 00:00:00 UTC
      };

      // Act
      const result = jwtStrategy.validate(mockPayload);

      // Assert
      expect(result).toEqual({
        userId: 'user-with-timestamps',
        roles: ['user'],
      });
      // Перевіряємо, що iat та exp не включені в результат
      expect(result).not.toHaveProperty('iat');
      expect(result).not.toHaveProperty('exp');
    });
  });

  describe('Strategy Initialization', () => {
    it('should initialize with different JWT secrets', () => {
      // Test 1: Short secret
      process.env.JWT_SECRET = 'short';
      expect(() => new JwtStrategy()).not.toThrow();

      // Test 2: Long secret
      process.env.JWT_SECRET =
        'very-long-jwt-secret-key-for-maximum-security-12345';
      expect(() => new JwtStrategy()).not.toThrow();

      // Test 3: Secret with special characters
      process.env.JWT_SECRET = 'secret!@#$%^&*()_+-={}[]|\\:";\'<>?,./';
      expect(() => new JwtStrategy()).not.toThrow();
    });

    it('should create new instances independently', () => {
      // Arrange
      process.env.JWT_SECRET = 'test-secret-1';
      const strategy1 = new JwtStrategy();

      process.env.JWT_SECRET = 'test-secret-2';
      const strategy2 = new JwtStrategy();

      // Assert
      expect(strategy1).not.toBe(strategy2);
      expect(strategy1).toBeInstanceOf(JwtStrategy);
      expect(strategy2).toBeInstanceOf(JwtStrategy);
    });
  });

  describe('Method Availability', () => {
    beforeEach(() => {
      process.env.JWT_SECRET = 'test-secret-key';
      jwtStrategy = new JwtStrategy();
    });

    it('should have validate method available', () => {
      expect(jwtStrategy.validate).toBeDefined();
      expect(typeof jwtStrategy.validate).toBe('function');
    });

    it('should validate method work synchronously', () => {
      // Arrange
      const mockPayload: JwtPayload = {
        sub: 'sync-test-user',
        roles: ['user'],
      };

      // Act
      const start = Date.now();
      const result = jwtStrategy.validate(mockPayload);
      const end = Date.now();

      // Assert
      expect(result).toEqual({
        userId: 'sync-test-user',
        roles: ['user'],
      });
      // Метод повинен виконуватися швидко (синхронно)
      expect(end - start).toBeLessThan(10);
    });
  });
});
