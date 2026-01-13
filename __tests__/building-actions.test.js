/**
 * ISPITIVANJE KOMPONENTI - Test slučajevi za building-actions.js
 *
 * Ova datoteka sadrži testove za funkcionalnosti vezane uz zgrade:
 * - Test slučaj 7: Validacija uloga za kreiranje zgrade (redovni slučaj i exception throwing)
 */

import { describe, test, expect, beforeEach, jest } from "@jest/globals";

// Mock Supabase client
const mockAuth = {
    getUser: jest.fn(),
};

const mockFrom = jest.fn();

jest.mock("@/lib/supabase/server", () => ({
    createClient: jest.fn(async () => ({
        auth: mockAuth,
        from: mockFrom,
    })),
}));

// Import functions after mocks are set up
import { createBuilding } from "@/lib/actions/building-actions";

describe("Building Actions - Ispitivanje komponenti", () => {
    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Reset mockFrom to return chainable query builder
        mockFrom.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(),
        });
    });

    /**
     * TEST SLUČAJ 7: Validacija uloga za kreiranje zgrade
     *
     * Test 7a - Redovni slučaj:
     * Funkcionalnost: REPRESENTATIVE kreira zgradu sa validnim podacima
     *
     * Ulazni podaci:
     * - formData sa address: "Ulica 123" i postalCode: "10000"
     * - Autentificirani korisnik sa ulogom REPRESENTATIVE
     *
     * Očekivani rezultat:
     * - Zgrada uspješno kreirana
     * - Vraća objekt sa data.building i data.representative
     * - error: undefined
     *
     * Postupak provođenja:
     * 1. Mock autentificiranog korisnika
     * 2. Mock profile sa ulogom REPRESENTATIVE
     * 3. Mock uspješnog inserta zgrade
     * 4. Mock uspješnog inserta representative veze
     * 5. Poziv createBuilding funkcije
     * 6. Provjera uspješnog rezultata
     *
     * Test 7b - Exception throwing:
     * Funkcionalnost: Korisnik bez odgovarajuće uloge pokušava kreirati zgradu
     *
     * Ulazni podaci:
     * - formData sa address i postalCode
     * - Autentificirani korisnik sa ulogom TENANT (nije REPRESENTATIVE)
     *
     * Očekivani rezultat:
     * - Funkcija vraća error: "Only representatives can create buildings"
     * - Zgrada nije kreirana
     *
     * Postupak provođenja:
     * 1. Mock autentificiranog korisnika
     * 2. Mock profile sa ulogom TENANT
     * 3. Poziv createBuilding funkcije
     * 4. Provjera da je vraćen error
     * 5. Provjera da insert zgrade nije pozvan
     */
    test("Test slučaj 7a: Kreiranje zgrade sa ulogom REPRESENTATIVE (redovni slučaj)", async () => {
        // Arrange - priprema test podataka
        const mockUser = { id: "user-123", email: "rep@example.com" };
        const mockProfile = { role: "REPRESENTATIVE" };
        const mockBuilding = {
            building_id: "building-456",
            address: "Ulica 123",
            postal_code: "10000",
        };
        const mockRepresentative = {
            user_id: "user-123",
            building_id: "building-456",
        };

        const formData = new FormData();
        formData.append("address", "Ulica 123");
        formData.append("postalCode", "10000");

        // Mock getUser
        mockAuth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        // Setup mockFrom to return appropriate builder based on table name
        // Order: profile -> building -> representative
        mockFrom.mockImplementation((table) => {
            const chainable = {
                select: jest.fn().mockReturnThis(),
                insert: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn(),
            };

            if (table === "profile") {
                chainable.single = jest.fn().mockResolvedValue({
                    data: mockProfile,
                    error: null,
                });
            } else if (table === "building") {
                chainable.single = jest.fn().mockResolvedValue({
                    data: mockBuilding,
                    error: null,
                });
            } else if (table === "representative") {
                chainable.single = jest.fn().mockResolvedValue({
                    data: mockRepresentative,
                    error: null,
                });
            }

            return chainable;
        });

        // Act - izvršavanje testa
        const result = await createBuilding(formData);

        // Assert - provjera uspješnog rezultata
        expect(result.error).toBeUndefined();
        expect(result.data).toBeDefined();
        expect(result.data.building).toBeDefined();
        expect(result.data.building.address).toBe("Ulica 123");
        expect(result.data.representative).toBeDefined();
        expect(result.data.representative.building_id).toBe("building-456");
    });

    test("Test slučaj 7b: Pokušaj kreiranja zgrade bez uloge REPRESENTATIVE (exception throwing)", async () => {
        // Arrange - priprema test podataka sa TENANT ulogom
        const mockUser = { id: "user-789", email: "tenant@example.com" };
        const mockProfile = { role: "TENANT" }; // Nije REPRESENTATIVE

        const formData = new FormData();
        formData.append("address", "Ulica 456");
        formData.append("postalCode", "20000");

        // Mock getUser
        mockAuth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        // Setup mockFrom to return profile with TENANT role
        mockFrom.mockImplementation((table) => {
            if (table === "profile") {
                return {
                    select: jest.fn().mockReturnThis(),
                    eq: jest.fn().mockReturnThis(),
                    single: jest.fn().mockResolvedValue({
                        data: mockProfile,
                        error: null,
                    }),
                };
            }
            return {
                select: jest.fn().mockReturnThis(),
                insert: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn(),
            };
        });

        // Act - izvršavanje testa
        const result = await createBuilding(formData);

        // Assert - provjera da je vraćen error
        expect(result.error).toBeDefined();
        expect(result.error).toBe("Only representatives can create buildings");

        // Provjera da insert zgrade nije pozvan (samo profile query je pozvan)
        const buildingCalls = mockFrom.mock.calls.filter(
            (call) => call[0] === "building"
        );
        expect(buildingCalls.length).toBe(0);
    });

    test("Test slučaj 7c: Pokušaj kreiranja zgrade bez autentifikacije (exception throwing)", async () => {
        // Arrange - priprema test podataka bez autentificiranog korisnika
        const formData = new FormData();
        formData.append("address", "Ulica 789");
        formData.append("postalCode", "30000");

        // Mock getUser - nema korisnika
        mockAuth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: "Not authenticated" },
        });

        // Act - izvršavanje testa
        const result = await createBuilding(formData);

        // Assert - provjera da je vraćen error
        expect(result.error).toBeDefined();
        expect(result.error).toBe("Not authenticated");
    });
});
