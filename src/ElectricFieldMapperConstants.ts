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

/** Size of the charges-and-sensors toolbox and the row of its three icons (screen pixels). */
export const CHARGE_TOOLBOX_WIDTH = 236;
export const CHARGE_TOOLBOX_HEIGHT = 76;
export const CHARGE_TOOLBOX_ICON_INSET = 40;
export const CHARGE_TOOLBOX_ICON_Y = 29;

/** Radius of a drawn charge sphere (screen pixels); close to CHARGE_RADIUS on the board. */
export const CHARGE_VIEW_RADIUS = 12;

/** Radius of the yellow electric field sensor disk (screen pixels). */
export const FIELD_SENSOR_VIEW_RADIUS = 7;

/** Radius of the voltmeter crosshair ring (screen pixels). */
export const VOLTMETER_CROSSHAIR_RADIUS = 18;

// ── Physics / model defaults (SI units) ───────────────────────────────────────

// Example: export const GRAVITY_MPS2 = 9.81; // m/s²

ElectricFieldMapperNamespace.register("ElectricFieldMapperConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  CHARGE_TOOLBOX_WIDTH,
  CHARGE_TOOLBOX_HEIGHT,
  CHARGE_TOOLBOX_ICON_INSET,
  CHARGE_TOOLBOX_ICON_Y,
  CHARGE_VIEW_RADIUS,
  FIELD_SENSOR_VIEW_RADIUS,
  VOLTMETER_CROSSHAIR_RADIUS,
});
