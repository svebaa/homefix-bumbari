import { test, expect } from '../fixtures/page.js';

/**
 * Test 4: Pristup nepostojećoj ruti (Nepostojeća funkcionalnost)
 * 
 * Ulaz: Pristup /non-existent-page
 * Koraci: Navigacija na nepostojeću rutu → provjera odgovora
 * Očekivani izlaz: 404 stranica ili odgovarajuća greška
 */
test('Test 4: Pristup nepostojećoj ruti', async ({ page }) => {
  // Korak 1: Navigacija na nepostojeću rutu
  const response = await page.goto('/non-existent-page-that-does-not-exist-12345');
  
  // Korak 2: Provjera status koda (404 Not Found)
  expect(response?.status()).toBe(404);
  
  // Korak 3: Provjera da se prikazuje 404 stranica ili odgovarajuća greška
  // Next.js može prikazati custom 404 stranicu ili default "404 - This page could not be found"
  const pageContent = await page.textContent('body');
  expect(pageContent).toMatch(/404|not found|nije pronađen/i);
  
  // Screenshot za dokumentaciju
  await page.screenshot({ path: 'test-results/screenshots/test4-404-page.png', fullPage: true });
});

/**
 * Test 4b: Pristup nepostojećoj API ruti (Rubni uvjet)
 * 
 * Ulaz: Pristup /api/non-existent-endpoint
 * Koraci: Navigacija na nepostojeću API rutu → provjera odgovora
 * Očekivani izlaz: 404 ili odgovarajuća greška
 */
test('Test 4b: Pristup nepostojećoj API ruti', async ({ page }) => {
  // Korak 1: Navigacija na nepostojeću API rutu
  const response = await page.goto('/api/non-existent-endpoint-xyz');
  
  // Korak 2: Provjera status koda (404 Not Found)
  expect(response?.status()).toBe(404);
  
  // Screenshot za dokumentaciju
  await page.screenshot({ path: 'test-results/screenshots/test4b-404-api.png', fullPage: true });
});
