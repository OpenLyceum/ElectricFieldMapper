/**
 * ElectricFieldMapperConstants.ts
 *
 * Central repository for every named numeric constant used across the
 * simulation. Bare numbers that carry semantic meaning (sizes, margins,
 * physics defaults, ranges) belong here rather than inline in model or view
 * code, so they are named, documented, and changed in one place.
 *
 * Conventions
 * ───────────
 *  - Physics / model values use SI units (metres, seconds, kilograms, …);
 *    note the unit in a comment on each value.
 *  - Layout / chrome values are in screen pixels.
 *  - Colour strings live in ElectricFieldMapperColors.ts, not here.
 *  - Computed expressions (e.g. `2 * Math.PI`) may stay inline.
 *
 * Remove the example constants below and replace them with the sim's own.
 */

import ElectricFieldMapperNamespace from "./ElectricFieldMapperNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

/** Size and icon positions of the reusable charge toolbox (screen pixels). */
export const CHARGE_TOOLBOX_WIDTH = 236;
export const CHARGE_TOOLBOX_HEIGHT = 76;
export const CHARGE_TOOLBOX_ICON_X = 59;
export const CHARGE_TOOLBOX_ICON_Y = 29;

// ── Physics / model defaults (SI units) ───────────────────────────────────────

// Example: export const GRAVITY_MPS2 = 9.81; // m/s²

ElectricFieldMapperNamespace.register("ElectricFieldMapperConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  CHARGE_TOOLBOX_WIDTH,
  CHARGE_TOOLBOX_HEIGHT,
  CHARGE_TOOLBOX_ICON_X,
  CHARGE_TOOLBOX_ICON_Y,
});
