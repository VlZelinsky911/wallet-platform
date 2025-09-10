jest.setTimeout(30000);


process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-e2e-testing-only';
process.env.MONGO_URI_AUTH = 'mongodb://localhost:27017/test-mock';
