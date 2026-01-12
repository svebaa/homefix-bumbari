/**
 * Global teardown za E2E testove
 * Očisti test korisnike nakon završetka svih testova
 */
import { cleanupTestUsers } from './fixtures/auth.js';

async function globalTeardown() {
  console.log('🧹 Cleaning up test users after tests...');
  try {
    await cleanupTestUsers();
    console.log('✅ Test users cleaned up');
  } catch (error) {
    console.warn('⚠️  Failed to cleanup test users:', error.message);
  }
}

export default globalTeardown;
