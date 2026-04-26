// Environment variables required by the app during tests.
// These are set before any test module is imported.
process.env.JWT_SECRET = 'test_jwt_secret_key_for_jest_testing_32c';
process.env.JWT_EXPIRES_IN = '1h';
process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
