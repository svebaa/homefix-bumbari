/**
 * Global setup za E2E testove
 * Očisti test korisnike prije pokretanja testova
 */
import { cleanupTestUsers } from './fixtures/auth.js';

async function globalSetup() {
  console.log('🧹 Cleaning up test users before tests...');
  try {
    await cleanupTestUsers();
    console.log('✅ Test users cleaned up');
  } catch (error) {
    console.warn('⚠️  Failed to cleanup test users:', error.message);
  }
}

export default globalSetup;
