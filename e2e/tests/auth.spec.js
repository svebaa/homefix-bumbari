import { test, expect } from '../fixtures/page.js';
import { createTestUser, deleteTestUserByEmail } from '../fixtures/auth.js';

// Test korisnici
const TEST_USER = {
    email: 'test@example.com',
    password: 'password123',
};

const NEW_USER = {
    email: 'newuser@example.com',
    password: 'password123',
    firstName: 'Ivan',
    lastName: 'Horvat',
};

/**
 * Test 1: Uspješna prijava (Redovni slučaj)
 * 
 * Ulaz: Validni email i lozinka
 * Koraci: Otvaranje aplikacije → unos podataka → klik na "Prijavi se" → provjera preusmjeravanja
 * Očekivani izlaz: Preusmjeren na /dashboard
 */
test('Test 1: Uspješna prijava s validnim podacima', async ({ page }) => {
  // Setup: Kreiraj test korisnika prije testa
  await createTestUser(TEST_USER.email, TEST_USER.password);

  try {
    // Korak 1: Otvaranje aplikacije
    await page.goto('/login');
    await expect(page).toHaveTitle(/Prijava/);

    // Korak 2: Unos podataka u formu
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);

    // Korak 3: Kliknuti na "Prijavi se"
    await page.click('button[type="submit"]');

    // Korak 4: Provjera preusmjeravanja na dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    
    // Screenshot za dokumentaciju
    await page.screenshot({ path: 'test-results/screenshots/test1-successful-login.png', fullPage: true });
  } finally {
    // Cleanup: Obriši test korisnika nakon testa
    await deleteTestUserByEmail(TEST_USER.email);
  }
});

/**
 * Test 2: Neuspješna prijava s nevažećim podacima (Rubni uvjet)
 * 
 * Ulaz: Nevažeći email ili lozinka
 * Koraci: Otvaranje aplikacije → unos nevažećih podataka → klik na "Prijavi se" → provjera poruke o grešci
 * Očekivani izlaz: Poruka o grešci "Pogrešno korisničko ime ili lozinka"
 */
test('Test 2: Neuspješna prijava s nevažećim podacima', async ({ page }) => {
  // Nema setup-a - koristimo nevažeće podatke koji ne postoje u bazi

  // Korak 1: Otvaranje aplikacije
  await page.goto('/login');
  await expect(page).toHaveTitle(/Prijava/);

  // Korak 2: Unos nevažećih podataka
  await page.fill('input[name="email"]', 'invalid@example.com');
  await page.fill('input[name="password"]', 'wrongpassword');

  // Korak 3: Kliknuti na "Prijavi se"
  await page.click('button[type="submit"]');

  // Korak 4: Provjera poruke o grešci
  await expect(page.locator('text=/Invalid|Pogrešno|greška/i')).toBeVisible({ timeout: 5000 });
  
  // Provjera da korisnik NIJE preusmjeren
  await expect(page).toHaveURL(/.*\/login/);
  
  // Screenshot za dokumentaciju
  await page.screenshot({ path: 'test-results/screenshots/test2-failed-login.png', fullPage: true });
});

/**
 * Test 3: Registracija s validnim podacima (Redovni slučaj)
 * 
 * Ulaz: Validni email, lozinka, ime, prezime
 * Koraci: Otvaranje /register → unos podataka → klik na "Registriraj se" → provjera preusmjeravanja
 * Očekivani izlaz: Preusmjeren na /register/choose-role
 */
test('Test 3: Registracija s validnim podacima', async ({ page }) => {
  // Setup: Obriši korisnika ako već postoji (za clean test)
  await deleteTestUserByEmail(NEW_USER.email);

  try {
    // Korak 1: Otvaranje stranice za registraciju
    await page.goto('/register');
    await expect(page).toHaveTitle(/Registracija/);

    // Korak 2: Unos podataka u formu
    await page.fill('input[name="firstName"]', NEW_USER.firstName);
    await page.fill('input[name="lastName"]', NEW_USER.lastName);
    await page.fill('input[name="email"]', NEW_USER.email);
    await page.fill('input[name="password"]', NEW_USER.password);
    await page.fill('input[name="confirmPassword"]', NEW_USER.password);

    // Korak 3: Kliknuti na "Registriraj se"
    await page.click('button[type="submit"]');

    // Korak 4: Provjera preusmjeravanja na odabir uloge
    await expect(page).toHaveURL(/.*\/register\/choose-role/, { timeout: 10000 });
    
    // Screenshot za dokumentaciju
    await page.screenshot({ path: 'test-results/screenshots/test3-successful-registration.png', fullPage: true });
  } finally {
    // Cleanup: Obriši test korisnika nakon testa
    await deleteTestUserByEmail(NEW_USER.email);
  }
});

/**
 * Test 3b: Registracija s nepodudarajućim lozinkama (Rubni uvjet)
 * 
 * Ulaz: Validni podaci ali lozinke se ne podudaraju
 * Koraci: Otvaranje /register → unos podataka s različitim lozinkama → klik na "Registriraj se"
 * Očekivani izlaz: Poruka o grešci "Lozinke se ne podudaraju"
 */
test('Test 3b: Registracija s nepodudarajućim lozinkama', async ({ page }) => {
  // Korak 1: Otvaranje stranice za registraciju
  await page.goto('/register');
  await expect(page).toHaveTitle(/Registracija/);

  // Korak 2: Unos podataka s različitim lozinkama
  await page.fill('input[name="firstName"]', 'Ivan');
  await page.fill('input[name="lastName"]', 'Horvat');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.fill('input[name="confirmPassword"]', 'differentpassword');

  // Korak 3: Kliknuti na "Registriraj se"
  await page.click('button[type="submit"]');

  // Korak 4: Provjera poruke o grešci
  await expect(page.locator('text=/Lozinke se ne podudaraju/i')).toBeVisible({ timeout: 5000 });
  
  // Provjera da korisnik NIJE preusmjeren
  await expect(page).toHaveURL(/.*\/register/);
  
  // Screenshot za dokumentaciju
  await page.screenshot({ path: 'test-results/screenshots/test3b-password-mismatch.png', fullPage: true });
});
