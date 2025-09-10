import { AppModule } from './app.module';
import { ModuleImport, isModuleImport } from './auth/types/test.types';

describe('AppModule', () => {
  describe('Module Definition', () => {
    it('should be defined as a class', () => {
      // Assert
      expect(AppModule).toBeDefined();
      expect(typeof AppModule).toBe('function');
      expect(AppModule.name).toBe('AppModule');
    });

    it('should have module decorator metadata', () => {
      // Assert
      const hasImports = Reflect.hasMetadata('imports', AppModule);
      expect(hasImports).toBe(true);
    });

    it('should be instantiable', () => {
      // Act
      const instance = new AppModule();

      // Assert
      expect(instance).toBeDefined();
      expect(instance).toBeInstanceOf(AppModule);
    });
  });

  describe('Module Metadata', () => {
    it('should have imports metadata', () => {
      // Act
      const imports = Reflect.getMetadata('imports', AppModule) as unknown[];

      // Assert
      expect(imports).toBeDefined();
      expect(Array.isArray(imports)).toBe(true);
      expect(imports.length).toBeGreaterThan(0);
    });

    it('should not have providers metadata (since it only imports other modules)', () => {
      // Act
      const providers = Reflect.getMetadata('providers', AppModule) as unknown;

      // Assert
      expect(providers).toBeUndefined();
    });

    it('should not have controllers metadata', () => {
      // Act
      const controllers = Reflect.getMetadata(
        'controllers',
        AppModule,
      ) as unknown;

      // Assert
      expect(controllers).toBeUndefined();
    });

    it('should not have exports metadata', () => {
      // Act
      const exports = Reflect.getMetadata('exports', AppModule) as unknown;

      // Assert
      expect(exports).toBeUndefined();
    });
  });

  describe('Module Structure', () => {
    it('should have correct number of imports', () => {
      // Act
      const imports = Reflect.getMetadata('imports', AppModule) as unknown[];

      // Assert
      expect(imports).toHaveLength(4); // GraphQL, Mongoose, Auth, Users modules
    });

    it('should import GraphQL module configuration', () => {
      // Act
      const imports = Reflect.getMetadata('imports', AppModule) as unknown[];

      // Assert
      const hasGraphQLModule = imports.some(
        (imp): imp is ModuleImport =>
          isModuleImport(imp) && imp.module?.name === 'GraphQLModule',
      );
      expect(hasGraphQLModule).toBe(true);
    });

    it('should import Mongoose module configuration', () => {
      // Act
      const imports = Reflect.getMetadata('imports', AppModule) as unknown[];

      // Assert
      const hasMongooseModule = imports.some(
        (imp): imp is ModuleImport =>
          isModuleImport(imp) && imp.module?.name === 'MongooseModule',
      );
      expect(hasMongooseModule).toBe(true);
    });
  });

  describe('Configuration Validation', () => {
    it('should have valid module decorator configuration', () => {
      // Act
      const moduleConfig = Reflect.getMetadata(
        'imports',
        AppModule,
      ) as unknown[];

      // Assert
      expect(moduleConfig).toBeTruthy();
      expect(Array.isArray(moduleConfig)).toBe(true);

      // Перевіряємо, що всі імпорти визначені
      moduleConfig.forEach((imp: unknown) => {
        expect(imp).toBeDefined();
      });
    });

    it('should be a proper NestJS module', () => {
      // Перевіряємо, що клас має необхідні метадані для NestJS модуля
      const hasModuleMetadata =
        Reflect.hasMetadata('imports', AppModule) ||
        Reflect.hasMetadata('providers', AppModule) ||
        Reflect.hasMetadata('controllers', AppModule) ||
        Reflect.hasMetadata('exports', AppModule);

      expect(hasModuleMetadata).toBe(true);
    });
  });

  describe('Class Properties and Methods', () => {
    it('should not have any instance properties', () => {
      // Act
      const instance = new AppModule();
      const keys = Object.keys(instance);

      // Assert
      expect(keys).toHaveLength(0);
    });

    it('should not have any prototype methods except constructor', () => {
      // Act
      const prototype = AppModule.prototype;
      const methods = Object.getOwnPropertyNames(prototype);

      // Assert
      expect(methods).toEqual(['constructor']);
    });

    it('should have empty constructor', () => {
      // Act
      const constructor = AppModule.prototype.constructor;

      // Assert
      expect(constructor).toBeDefined();
      expect(constructor.length).toBe(0); // no parameters
    });
  });

  describe('Module Instantiation', () => {
    it('should create multiple instances independently', () => {
      // Act
      const instance1 = new AppModule();
      const instance2 = new AppModule();

      // Assert
      expect(instance1).not.toBe(instance2);
      expect(instance1).toBeInstanceOf(AppModule);
      expect(instance2).toBeInstanceOf(AppModule);
    });

    it('should not throw errors during instantiation', () => {
      // Act & Assert
      expect(() => new AppModule()).not.toThrow();
    });
  });

  describe('TypeScript Compilation', () => {
    it('should have correct TypeScript class structure', () => {
      // Assert
      expect(AppModule).toHaveProperty('prototype');
      expect(AppModule).toHaveProperty('name', 'AppModule');
      expect(typeof AppModule).toBe('function');
    });

    it('should support instanceof checks', () => {
      // Act
      const instance = new AppModule();

      // Assert
      expect(instance instanceof AppModule).toBe(true);
      expect(instance instanceof Object).toBe(true);
    });
  });
});
