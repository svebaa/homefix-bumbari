// Mock for next/navigation

const { jest } = require('@jest/globals');

module.exports = {
  redirect: jest.fn(),
};
