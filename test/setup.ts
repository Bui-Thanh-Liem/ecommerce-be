import { rm } from 'fs/promises';
import { join } from 'path';

global.beforeEach(async () => {
  // Reset all mocks before each test
  jest.clearAllMocks();

  // Clean up the test database file before each test
  try {
    await rm(join(__dirname, '..', 'test.sqlite'), { force: true });
  } catch (error) {
    console.log('Error when delete file test.sqlite');
  }
});
