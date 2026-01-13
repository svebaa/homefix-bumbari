import { test as base } from "@playwright/test";
import { createTestUser } from "./auth.js";

export const test = base.extend({
    authenticatedPage: async ({ page }, use) => {
        const { deleteTestUser } = await import("./auth.js");
        const testUser = await createTestUser(
            "authenticated-test@example.com",
            "password123"
        );

        try {
            await page.goto("/login");
            await page.fill('input[name="email"]', testUser.email);
            await page.fill('input[name="password"]', "password123");
            await page.click('button[type="submit"]');
            await page.waitForURL(/.*\/dashboard/, { timeout: 10000 });

            await use(page);
        } finally {
            await deleteTestUser(testUser.id);
        }
    },
});

export { expect } from "@playwright/test";
