import { Logger } from '@nestjs/common';
import { rm } from 'fs/promises';
import { join } from 'path';

global.beforeEach(async () => {
  const logger = new Logger('TestSetup');

  // Reset all mocks before each test
  jest.clearAllMocks();

  // Clean up the test database file before each test
  try {
    await rm(join(__dirname, '..', 'test.sqlite'), { force: true });
  } catch (error) {
    logger.debug('Error when delete file test.sqlite', error);
  }
});
