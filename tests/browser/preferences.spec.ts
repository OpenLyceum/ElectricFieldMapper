import { expect, type Locator, type Page, test } from "@playwright/test";
import type { ExploreModel } from "../../src/explore/model/ExploreModel.js";

// Pointer clicks land on the simulation display, which covers the parallel DOM. A DOM click still activates the control.
const activate = (locator: Locator) => locator.evaluate((element: HTMLElement) => element.click());

const readDisplayPreferences = (page: Page) =>
  page.evaluate(() => {
    const model = window.phet["joist"].sim.screens[0]?.model as ExploreModel;
    return {
      voltageScale: model.voltageScaleProperty.value,
      arrowScale: model.arrowScaleProperty.value,
      linesPerNanocoulomb: model.linesPerNanocoulombProperty.value,
      fieldLineArrowheads: model.fieldLineArrowheadsProperty.value,
      showFieldZeros: model.showFieldZerosProperty.value,
    };
  });

test("simulation preferences open from the menu and survive reset", async ({ page }) => {
  await page.goto(
    "/?voltageScale=200&arrowScale=direction&linesPerNanocoulomb=8&showFieldZeros=true&fieldLineArrowheads=false&ea",
  );
  await page.waitForSelector("#sim");
  await expect
    .poll(() => readDisplayPreferences(page))
    .toEqual({
      voltageScale: "200",
      arrowScale: "direction",
      linesPerNanocoulomb: 8,
      fieldLineArrowheads: false,
      showFieldZeros: true,
    });

  // The navigation-bar button sits under the simulation display, so activate it from the keyboard.
  const preferencesButton = page.getByRole("button", { name: "Preferences" });
  await preferencesButton.focus();
  await page.keyboard.press("Enter");
  // A DOM click selects the tab. A pointer click is swallowed by the simulation display.
  await activate(page.getByRole("tab", { name: "Simulation" }));
  await expect(page.getByRole("radio", { name: "±200 V" })).toBeVisible();
  await expect(page.getByRole("radio", { name: "±200 V" })).toBeChecked();
  await expect(page.getByRole("radio", { name: "Direction only" })).toBeChecked();
  await expect(page.getByRole("radio", { name: "8", exact: true })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Arrowheads on field lines" })).not.toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Mark field zeros" })).toBeChecked();

  await activate(page.getByRole("radio", { name: "±10 V" }));
  await activate(page.getByRole("radio", { name: "Linear, clipped" }));
  await activate(page.getByRole("radio", { name: "16", exact: true }));
  await activate(page.getByRole("checkbox", { name: "Arrowheads on field lines" }));
  await activate(page.getByRole("checkbox", { name: "Mark field zeros" }));
  await page.keyboard.press("Escape");

  await expect
    .poll(() => readDisplayPreferences(page))
    .toEqual({
      voltageScale: "10",
      arrowScale: "linear",
      linesPerNanocoulomb: 16,
      fieldLineArrowheads: true,
      showFieldZeros: false,
    });

  await activate(page.getByRole("button", { name: "Reset all" }));
  await expect
    .poll(() => readDisplayPreferences(page))
    .toEqual({
      voltageScale: "10",
      arrowScale: "linear",
      linesPerNanocoulomb: 16,
      fieldLineArrowheads: true,
      showFieldZeros: false,
    });
});
