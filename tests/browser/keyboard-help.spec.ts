import { expect, test } from "@playwright/test";

for (const { locale, buttonName, heading, removal } of [
  {
    locale: "en",
    buttonName: "Keyboard Shortcuts",
    heading: "Move and remove tools",
    removal: /Press Delete or Backspace/,
  },
  {
    locale: "es",
    buttonName: "Keyboard Shortcuts",
    heading: "Mover y retirar herramientas",
    removal: /Pulsa Supr o Retroceso/,
  },
  {
    locale: "fr",
    buttonName: "Keyboard Shortcuts",
    heading: "Déplacer et retirer les outils",
    removal: /Appuyez sur Suppr ou Retour arrière/,
  },
]) {
  test(`keyboard help documents movement and removal in ${locale}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/?locale=${locale}&ea`);
    await page.waitForSelector("#sim");
    const helpButton = page.getByRole("button", { name: buttonName, exact: true });
    await helpButton.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    await expect(page.getByRole("listitem").filter({ hasText: removal })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(helpButton).toBeFocused();
    expect(errors).toEqual([]);
  });
}
