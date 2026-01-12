// Mock for next/cache

const { jest } = require('@jest/globals');

module.exports = {
  revalidatePath: jest.fn(),
};
