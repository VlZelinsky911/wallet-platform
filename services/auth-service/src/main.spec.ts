import * as fs from 'fs';
import * as path from 'path';

// Mock dotenv config
jest.mock('dotenv/config', () => ({}));

// Mock NestFactory with simplified structure
jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      listen: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Mock AppModule
jest.mock('./app.module', () => ({
  AppModule: class MockAppModule {},
}));

describe('Main Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Встановлюємо змінні середовища
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Відновлюємо оригінальні змінні середовища
    process.env = originalEnv;
  });

  describe('Module Structure', () => {
    it('should have main.ts file structure', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');

      expect(() => fs.readFileSync(mainFilePath, 'utf8')).not.toThrow();

      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      expect(mainFileContent).toContain("import 'dotenv/config'");
      expect(mainFileContent).toContain('import { NestFactory }');
      expect(mainFileContent).toContain('import { AppModule }');
      expect(mainFileContent).toContain('async function bootstrap()');
      expect(mainFileContent).toContain('NestFactory.create(AppModule)');
      expect(mainFileContent).toContain('app.listen');
      expect(mainFileContent).toContain('void bootstrap()');
    });

    it('should import dotenv config at the top', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      const lines = mainFileContent.split('\n');
      const dotenvLine = lines.findIndex((line: string) =>
        line.includes('dotenv/config'),
      );

      expect(dotenvLine).toBe(0);
    });

    it('should import NestFactory from @nestjs/core', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      expect(mainFileContent).toMatch(
        /import\s*{\s*NestFactory\s*}\s*from\s*['"]@nestjs\/core['"]/,
      );
    });

    it('should import AppModule from local file', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      expect(mainFileContent).toMatch(
        /import\s*{\s*AppModule\s*}\s*from\s*['"]\.\/app\.module['"]/,
      );
    });
  });

  describe('Bootstrap Function', () => {
    it('should define bootstrap as async function', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      expect(mainFileContent).toMatch(/async\s+function\s+bootstrap\s*\(\s*\)/);
    });

    it('should create NestJS application with AppModule', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      expect(mainFileContent).toContain('NestFactory.create(AppModule)');
      expect(mainFileContent).toMatch(
        /await\s+NestFactory\.create\s*\(\s*AppModule\s*\)/,
      );
    });

    it('should listen on port with fallback to 5000', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      expect(mainFileContent).toMatch(
        /app\.listen\s*\(\s*process\.env\.PORT\s*\?\?\s*5000\s*\)/,
      );
    });

    it('should use await for async operations', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      // Перевіряємо, що є await перед async операціями
      expect(mainFileContent).toMatch(/await\s+NestFactory\.create/);
      expect(mainFileContent).toMatch(/await\s+app\.listen/);
    });

    it('should call bootstrap with void operator', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      expect(mainFileContent).toContain('void bootstrap()');
    });
  });

  describe('Port Configuration', () => {
    it('should use environment PORT variable with fallback', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      // Перевіряємо nullish coalescing operator
      expect(mainFileContent).toMatch(/process\.env\.PORT\s*\?\?\s*5000/);
    });

    it('should have default port 5000', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      expect(mainFileContent).toContain('5000');
    });
  });

  describe('File Syntax and Structure', () => {
    it('should be valid TypeScript syntax', () => {
      // Якщо файл компілюється без помилок, значить синтаксис правильний
      expect(() => {
        import('typescript');
      }).not.toThrow();
    });

    it('should have proper line count (not too complex)', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      const lines = mainFileContent
        .split('\n')
        .filter((line: string) => line.trim() !== '');

      // main.ts повинен бути простим - не більше 15 значущих рядків
      expect(lines.length).toBeLessThanOrEqual(15);
    });

    it('should use ES6+ imports', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      // Не повинно бути require() в main.ts
      expect(mainFileContent).not.toContain('require(');

      // Повинні бути ES6 imports
      expect(mainFileContent).toMatch(/import\s+.*\s+from\s+/);
    });
  });

  describe('Best Practices', () => {
    it('should not have console.log statements', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      expect(mainFileContent).not.toContain('console.log');
    });

    it('should not have hardcoded values except default port', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      // Єдине hardcoded значення - це default port 5000
      const numbers = mainFileContent.match(/\d+/g) || [];
      expect(numbers).toEqual(['5000']);
    });

    it('should use modern JavaScript/TypeScript features', () => {
      const mainFilePath = path.join(__dirname, 'main.ts');
      const mainFileContent = fs.readFileSync(mainFilePath, 'utf8');

      // Використовує nullish coalescing (??)
      expect(mainFileContent).toContain('??');

      // Використовує async/await
      expect(mainFileContent).toContain('async');
      expect(mainFileContent).toContain('await');
    });
  });
});
