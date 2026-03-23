import { expect, test } from "@playwright/test";

const loginWithCredentials = async (page: import("@playwright/test").Page, name: string, password: string) => {
    await page.goto("/login");
    await page.getByText("Du hast bereits einen Account?").click();
    await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();

    await page.locator("#mcNameInput").fill(name);
    await page.locator("#passwordInput").fill(password);
    await page.getByRole("button", { name: "Login" }).click();

    try {
        await page.waitForURL("**/dashboard", { timeout: 30_000 });
    } catch {
        const status = (await page.locator("h2.status").textContent().catch(() => null))?.trim();
        throw new Error(`Login failed, still on ${page.url()}${status ? ` (status: ${status})` : ""}`);
    }

    await expect(page.getByText("Willkommen")).toBeVisible({ timeout: 20_000 });
};

const parsePrice = (raw: string): number | null => {
    const cleaned = raw
        .replace("Preis:", "")
        .replace("$", "")
        .replace(/\s+/g, "")
        .trim();

    if (!cleaned) return null;

    let multiplier = 1;
    let base = cleaned;

    if (base.endsWith("Mrd")) {
        multiplier = 1_000_000_000;
        base = base.slice(0, -3);
    } else if (base.endsWith("Bio")) {
        multiplier = 1_000_000_000_000;
        base = base.slice(0, -3);
    } else if (base.endsWith("K")) {
        multiplier = 1_000;
        base = base.slice(0, -1);
    } else if (base.endsWith("M")) {
        multiplier = 1_000_000;
        base = base.slice(0, -1);
    }

    const value = Number(base.replace(/,/g, ""));
    if (!Number.isFinite(value)) return null;

    return value * multiplier;
};

test("auction list loads, sort changes, and info button updates hash", async ({ page }) => {
    await page.goto("/opsucht/auction");
    await expect(page.locator(".auction-card").first()).toBeVisible({ timeout: 20_000 });

    const firstCategory = page.locator(".category-parent-btn").first();
    await expect(firstCategory).toBeVisible();
    await firstCategory.click();
    await expect(page.locator(".auction-card").first()).toBeVisible({ timeout: 20_000 });

    const firstChildCategory = page.locator(".category-child-btn").first();
    if (await firstChildCategory.isVisible()) {
        await firstChildCategory.click();
        await expect(page.locator(".auction-card").first()).toBeVisible({ timeout: 20_000 });
    }

    const orderSelect = page.locator(".auction-toolbar-rarity select").first();
    await orderSelect.selectOption("moneyAsc");

    const prices = await page
        .locator(".auction-card .price-row p")
        .evaluateAll((nodes) => nodes.map((n) => n.textContent || ""));

    const parsed = prices
        .map((text) => parsePrice(text))
        .filter((value): value is number => value !== null)
        .slice(0, 5);

    if (parsed.length >= 2) {
        for (let i = 1; i < parsed.length; i += 1) {
            expect(parsed[i]).toBeGreaterThanOrEqual(parsed[i - 1]);
        }
    }

    await page.locator(".auction-card .auction-button").first().click();
    await expect(page).toHaveURL(/#auction=/);
});

test.describe.serial("account lifecycle (login/logout/delete)", () => {
    test("register, logout, login, delete account", async ({ page }) => {
        const registerName = process.env.E2E_REGISTER_NAME;
        const registerPassword = process.env.E2E_REGISTER_PASSWORD;
        const allowDelete = process.env.E2E_ALLOW_DELETE === "true";

        test.skip(!registerName || !registerPassword, "Set E2E_REGISTER_NAME and E2E_REGISTER_PASSWORD in .env");

        await page.goto("/login");
        await expect(page.getByRole("heading", { name: "Registrieren" })).toBeVisible();

        await page.locator("#mcNameInput").fill(registerName as string);
        await page.getByRole("button", { name: "Minecraft Name Verifizieren" }).click();

        await expect(page.getByRole("heading", { name: "Minecraft Verifizierung" })).toBeVisible();
        await page.getByRole("button", { name: "Weiter" }).click();

        await expect(page.getByRole("heading", { name: "Auktionshaus" })).toBeVisible();
        await page.getByRole("button", { name: "Verifizierung Starten" }).click();

        await expect(page.getByRole("heading", { name: "Dies kann einen Augenblick dauern..." })).toBeVisible();
        await page.getByRole("button", { name: "Weiter" }).click();

        await expect(page.getByText("Password:")).toBeVisible();
        await page.locator("#passwordInput").fill(registerPassword as string);
        await page.locator("#passwordConfirm").fill(registerPassword as string);
        await page.getByRole("button", { name: "Account Erstellen" }).click();

        const arrived = await Promise.race([
            page.waitForURL("**/dashboard", { timeout: 30_000 }).then(() => "dashboard"),
            page.getByText("Du hast bereits einen Account!").waitFor({ state: "visible", timeout: 30_000 }).then(() => "exists"),
        ]);

        if (arrived === "exists") {
            await loginWithCredentials(page, registerName as string, registerPassword as string);
        } else {
            await expect(page.getByText("Willkommen")).toBeVisible();
        }

        await page.goto("/dashboard/settings");
        await page.getByRole("button", { name: /log out/i }).click();
        await page.waitForURL("**/login", { timeout: 20_000 });

        await loginWithCredentials(page, registerName as string, registerPassword as string);

        test.skip(!allowDelete, "Set E2E_ALLOW_DELETE=true to enable account deletion");

        await page.goto("/dashboard/settings");
        const deleteButton = page.getByRole("button", { name: /account.*löschen/i });
        await expect(deleteButton).toBeVisible();
        for (let i = 0; i < 3; i += 1) {
            await deleteButton.click();
        }

        await page.waitForURL("**/login", { timeout: 20_000 });
    });
});
