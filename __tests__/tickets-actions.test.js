/**
 * ISPITIVANJE KOMPONENTI - Test slučajevi za tickets-actions.js
 * 
 * Ova datoteka sadrži testove za funkcionalnosti vezane uz tikete:
 * - Test slučaj 1: Validacija ulaznih podataka za kreiranje ticketa (redovni slučaj)
 * - Test slučaj 2: Validacija ulaznih podataka za kreiranje ticketa (rubni uvjet)
 * - Test slučaj 3: Dodjela majstora ticketu prema specijalizaciji (exception throwing)
 * - Test slučaj 4: Ažuriranje statusa ticketa (rubni uvjet)
 * - Test slučaj 5: Dohvaćanje nepostojećeg ticketa (nepostojeća funkcionalnost)
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock Supabase client
const mockAuth = {
  getUser: jest.fn(),
};

const mockFrom = jest.fn();

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(async () => ({
    auth: mockAuth,
    from: mockFrom,
  })),
}));

// Mock Next.js cache
const mockRevalidatePath = jest.fn();
jest.mock('next/cache', () => ({
  revalidatePath: (...args) => mockRevalidatePath(...args),
}));

// Import functions after mocks are set up
import { 
  createTicket, 
  getTicket, 
  assignContractor, 
  updateTicketStatus 
} from '@/lib/actions/tickets-actions';

describe('Tickets Actions - Ispitivanje komponenti', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Reset mockFrom to return chainable query builder
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    });
  });

  /**
   * TEST SLUČAJ 1: Validacija ulaznih podataka za kreiranje ticketa - REDOVNI SLUČAJ
   * 
   * Funkcionalnost: Kreiranje novog ticketa sa validnim podacima
   * 
   * Ulazni podaci:
   * - title: "Problema s vodom"
   * - description: "Cureća cijev u kuhinji"
   * - issue_category: "PLUMBING"
   * - Autentificirani korisnik (user_id: "user-123")
   * - Tenant podaci (unit_id: "unit-456")
   * 
   * Očekivani rezultat: 
   * - Ticket uspješno kreiran
   * - Vraća objekt sa error: null i data sa podacima ticketa
   * - Poziva revalidatePath("/tickets")
   * 
   * Postupak provođenja:
   * 1. Mock autentificiranog korisnika
   * 2. Mock tenant podataka
   * 3. Mock uspješnog inserta u bazu
   * 4. Poziv createTicket funkcije
   * 5. Provjera da je rezultat uspješan
   */
  test('Test slučaj 1: Kreiranje ticketa sa validnim podacima (redovni slučaj)', async () => {
    // Arrange - priprema test podataka
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const mockTenant = { unit_id: 'unit-456' };
    const mockTicket = {
      ticket_id: 'ticket-789',
      title: 'Problema s vodom',
      description: 'Cureća cijev u kuhinji',
      issue_category: 'PLUMBING',
      status: 'OPEN',
      created_by: 'user-123',
      unit_id: 'unit-456',
    };

    // Mock getUser - autentificirani korisnik
    mockAuth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock tenant query
    const tenantQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockTenant,
        error: null,
      }),
    };

    // Mock ticket insert
    const ticketInsertBuilder = {
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: mockTicket,
        error: null,
      }),
    };

    // Setup mockFrom to return appropriate builder based on table name
    mockFrom.mockImplementation((table) => {
      if (table === 'tenant') {
        return tenantQueryBuilder;
      } else if (table === 'ticket') {
        return ticketInsertBuilder;
      }
      return {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };
    });

    // Act - izvršavanje testa
    const result = await createTicket({
      title: 'Problema s vodom',
      description: 'Cureća cijev u kuhinji',
      issue_category: 'PLUMBING',
    });

    // Assert - provjera rezultata
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
    expect(result.data.title).toBe('Problema s vodom');
    expect(result.data.issue_category).toBe('PLUMBING');
    expect(result.data.status).toBe('OPEN');
    expect(mockRevalidatePath).toHaveBeenCalledWith('/tickets');
  });

  /**
   * TEST SLUČAJ 2: Validacija ulaznih podataka za kreiranje ticketa - RUBNI UVJET
   * 
   * Funkcionalnost: Provjera reakcije na nedostajuće obavezne parametre
   * 
   * Ulazni podaci:
   * - title: "" (prazan string)
   * - description: "Opis problema"
   * - issue_category: "PLUMBING"
   * 
   * Očekivani rezultat:
   * - Funkcija vraća error poruku: "Nedostaju obavezna polja: title, description, issue_category"
   * - Ne poziva Supabase insert
   * - Ne poziva revalidatePath
   * 
   * Postupak provođenja:
   * 1. Poziv createTicket sa praznim title poljem
   * 2. Provjera da je vraćen error
   * 3. Provjera da Supabase insert nije pozvan
   */
  test('Test slučaj 2: Kreiranje ticketa sa praznim title poljem (rubni uvjet)', async () => {
    // Arrange - priprema test podataka sa praznim title
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockAuth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Act - izvršavanje testa sa nedostajućim podacima
    const result = await createTicket({
      title: '', // Prazan string
      description: 'Opis problema',
      issue_category: 'PLUMBING',
    });

    // Assert - provjera da je vraćen error
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Nedostaju obavezna polja');
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  /**
   * TEST SLUČAJ 3: Dodjela majstora ticketu - NEKOMPATIBILNA SPECIJALIZACIJA (EXCEPTION THROWING)
   * 
   * Funkcionalnost: Provjera reakcije na pokušaj dodjele majstora sa nekompatibilnom specijalizacijom
   * 
   * Ulazni podaci:
   * - ticketId: "ticket-123"
   * - assigned_to: "contractor-456" (majstor sa specijalizacijom ELECTRICIAN)
   * - Ticket sa kategorijom: "PLUMBING"
   * - Autentificirani korisnik sa ulogom REPRESENTATIVE
   * 
   * Očekivani rezultat:
   * - Funkcija vraća error: "Nekompatibilno: kategorija kvara (PLUMBING) ≠ specijalizacija (ELECTRICIAN)"
   * - Ticket nije ažuriran
   * 
   * Postupak provođenja:
   * 1. Mock autentificiranog korisnika sa ulogom REPRESENTATIVE
   * 2. Mock ticket podataka sa kategorijom PLUMBING
   * 3. Mock contractor podataka sa specijalizacijom ELECTRICIAN
   * 4. Poziv assignContractor funkcije
   * 5. Provjera da je vraćen error o nekompatibilnosti
   */
  test('Test slučaj 3: Dodjela majstora sa nekompatibilnom specijalizacijom (exception throwing)', async () => {
    // Arrange - priprema test podataka
    const mockUser = { id: 'user-123', email: 'rep@example.com' };
    const mockProfile = { role: 'REPRESENTATIVE' };
    const mockTicket = {
      ticket_id: 'ticket-123',
      issue_category: 'PLUMBING',
      unit_id: 'unit-456',
      assigned_to: null,
      status: 'OPEN',
    };
    const mockContractor = {
      user_id: 'contractor-456',
      specialization: 'ELECTRICIAN', // Nekompatibilno sa PLUMBING
    };
    const mockBuilding = { building_id: 'building-789' };
    const mockRepresentative = { building_id: 'building-789' };

    // Mock getUser
    mockAuth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Setup mockFrom to return appropriate builder based on table name
    // Order: profile -> ticket -> building_unit -> representative -> contractor
    mockFrom.mockImplementation((table) => {
      const chainable = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
      };

      if (table === 'profile') {
        chainable.single = jest.fn().mockResolvedValue({
          data: mockProfile,
          error: null,
        });
      } else if (table === 'ticket') {
        chainable.single = jest.fn().mockResolvedValue({
          data: mockTicket,
          error: null,
        });
      } else if (table === 'building_unit') {
        chainable.single = jest.fn().mockResolvedValue({
          data: mockBuilding,
          error: null,
        });
      } else if (table === 'representative') {
        chainable.single = jest.fn().mockResolvedValue({
          data: mockRepresentative,
          error: null,
        });
      } else if (table === 'contractor') {
        chainable.single = jest.fn().mockResolvedValue({
          data: mockContractor,
          error: null,
        });
      }

      return chainable;
    });

    // Act - izvršavanje testa
    const result = await assignContractor('ticket-123', 'contractor-456');

    // Assert - provjera da je vraćen error o nekompatibilnosti
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Nekompatibilno');
    expect(result.error).toContain('PLUMBING');
    expect(result.error).toContain('ELECTRICIAN');
  });

  /**
   * TEST SLUČAJ 4: Ažuriranje statusa ticketa - RUBNI UVJET
   * 
   * Funkcionalnost: Provjera reakcije na pokušaj postavljanja nevaljanog statusa
   * 
   * Ulazni podaci:
   * - ticketId: "ticket-123"
   * - status: "INVALID_STATUS" (nevaljan status)
   * - Autentificirani korisnik
   * 
   * Očekivani rezultat:
   * - Funkcija vraća error: "Neispravan 'status' (dozvoljeno: OPEN, IN_PROGRESS, RESOLVED)"
   * - Status ticketa nije promijenjen
   * 
   * Postupak provođenja:
   * 1. Mock autentificiranog korisnika
   * 2. Poziv updateTicketStatus sa nevaljanim statusom
   * 3. Provjera da je vraćen error
   * 4. Provjera da Supabase update nije pozvan
   */
  test('Test slučaj 4: Ažuriranje statusa sa nevaljanim statusom (rubni uvjet)', async () => {
    // Arrange - priprema test podataka
    const mockUser = { id: 'user-123', email: 'test@example.com' };

    mockAuth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Act - izvršavanje testa sa nevaljanim statusom
    const result = await updateTicketStatus('ticket-123', 'INVALID_STATUS');

    // Assert - provjera da je vraćen error
    expect(result.error).toBeDefined();
    expect(result.error).toContain('Neispravan');
    expect(result.error).toContain('OPEN, IN_PROGRESS, RESOLVED');
    
    // Provjera da update nije pozvan jer je validacija prošla prije Supabase poziva
    const updateCalls = mockFrom.mock.calls.filter(call => call[0] === 'ticket');
    expect(updateCalls.length).toBe(0);
  });

  /**
   * TEST SLUČAJ 5: Dohvaćanje nepostojećeg ticketa - NEPOSTOJEĆA FUNKCIONALNOST
   * 
   * Funkcionalnost: Provjera reakcije na poziv sa ID-om ticketa koji ne postoji u bazi
   * 
   * Ulazni podaci:
   * - ticketId: "non-existent-ticket-999"
   * - Autentificirani korisnik
   * 
   * Očekivani rezultat:
   * - Funkcija vraća error: "Ticket nije pronađen."
   * - data: null
   * 
   * Postupak provođenja:
   * 1. Mock autentificiranog korisnika
   * 2. Mock Supabase query koji vraća error ili null za ticket
   * 3. Poziv getTicket funkcije
   * 4. Provjera da je vraćen error i null data
   */
  test('Test slučaj 5: Dohvaćanje nepostojećeg ticketa (nepostojeća funkcionalnost)', async () => {
    // Arrange - priprema test podataka
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    const nonExistentTicketId = 'non-existent-ticket-999';

    mockAuth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    // Mock ticket query koji vraća error (ticket ne postoji)
    mockFrom.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Ticket not found' },
      }),
    });

    // Act - izvršavanje testa
    const result = await getTicket(nonExistentTicketId);

    // Assert - provjera da je vraćen error
    expect(result.error).toBeDefined();
    expect(result.error).toBe('Ticket nije pronađen.');
    expect(result.data).toBeNull();
  });
});
