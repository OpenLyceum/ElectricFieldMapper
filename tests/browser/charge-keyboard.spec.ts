import { expect, type Page, test } from "@playwright/test";
import type { ExploreModel } from "../../src/explore/model/ExploreModel.js";

const readChargeState = (page: Page) =>
  page.evaluate(() => {
    const model = window.phet["joist"].sim.screens[0]?.model as ExploreModel;
    const position = model.charges[0]?.positionProperty.value;
    if (!position) {
      throw new Error("The first charge must remain on the board");
    }
    return {
      x: position.x,
      y: position.y,
      inside: model.keyboardDragBoundsProperty.value.containsPoint(position),
      gridAligned: Number.isInteger(position.x / 0.5) && Number.isInteger(position.y / 0.5),
      sources: model.getSnapshot().length,
    };
  });

const focusPositiveCharge = async (page: Page): Promise<void> => {
  await page.locator('div[tabindex="0"]').filter({ hasText: "Positive one nanocoulomb charge" }).first().focus();
};

test("snapped keyboard drags advance one grid square, including Shift and changes to snapping", async ({ page }) => {
  await page.goto("/?snapToGrid=true&ea");
  await page.waitForSelector("#sim");
  await focusPositiveCharge(page);
  const initial = await readChargeState(page);
  await page.keyboard.press("ArrowRight");
  expect((await readChargeState(page)).x).toBeCloseTo(initial.x + 0.5);
  await page.keyboard.press("Shift+ArrowDown");
  expect((await readChargeState(page)).y).toBeCloseTo(initial.y + 0.5);
  const snapCheckbox = page.getByRole("checkbox", { name: "Snap charges to grid", exact: true });
  await snapCheckbox.focus();
  await page.keyboard.press("Space");
  await expect(snapCheckbox).not.toBeChecked();
  await focusPositiveCharge(page);
  const unsnapped = await readChargeState(page);
  await page.keyboard.press("ArrowLeft");
  const afterUnsnapped = await readChargeState(page);
  expect(afterUnsnapped.x).toBeLessThan(unsnapped.x);
  expect(afterUnsnapped.x).toBeGreaterThan(unsnapped.x - 0.5);
  await snapCheckbox.focus();
  await page.keyboard.press("Space");
  await expect(snapCheckbox).toBeChecked();
  await focusPositiveCharge(page);
  const snapped = await readChargeState(page);
  await page.keyboard.press("ArrowUp");
  expect((await readChargeState(page)).y).toBeCloseTo(snapped.y - 0.5);
  expect((await readChargeState(page)).gridAligned).toBe(true);
});

for (const snap of [false, true]) {
  test(`held arrow keys stay on the board with snapping ${snap ? "on" : "off"}`, async ({ page }) => {
    await page.goto(`/?snapToGrid=${snap}&ea`);
    await page.waitForSelector("#sim");
    for (const key of ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]) {
      await page.evaluate(
        ({ direction, snapped }) => {
          const model = window.phet["joist"].sim.screens[0]?.model as ExploreModel;
          const charge = model.charges[0];
          if (!charge) {
            throw new Error("The charge must remain on the board");
          }
          const bounds = model.keyboardDragBoundsProperty.value;
          const position = charge.positionProperty.value.copy();
          position.x = direction === "ArrowLeft" ? bounds.minX + 0.01 : bounds.maxX - 0.01;
          position.y = direction === "ArrowUp" ? bounds.minY + 0.01 : bounds.maxY - 0.01;
          charge.positionProperty.value = snapped ? model.snapPosition(position) : position;
        },
        { direction: key, snapped: snap },
      );
      await focusPositiveCharge(page);
      await page.keyboard.down(key);
      try {
        await page.waitForTimeout(700);
        const held = await readChargeState(page);
        expect(held.inside).toBe(true);
        expect(held.sources).toBe(2);
        if (snap) {
          expect(held.gridAligned).toBe(true);
        }
      } finally {
        await page.keyboard.up(key);
      }
      expect((await readChargeState(page)).inside).toBe(true);
    }
  });
}
