// Mock for @/lib/supabase/admin

const { jest } = require('@jest/globals');

module.exports = {
  createAdminClient: jest.fn(() => ({
    auth: {
      admin: {
        inviteUserByEmail: jest.fn(),
      },
    },
  })),
};
