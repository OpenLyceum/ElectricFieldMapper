/**
 * ElectricFieldMapperConstants.ts
 *
 * Shared numeric constants used across the simulation. Local tracing, model,
 * and rendering constants live beside their algorithms (see AGENTS.md).
 * Name and document semantic sizes, margins, defaults, and ranges so they
 * can be changed in one place.
 *
 * Conventions
 * ───────────
 *  - Physics / model values use SI units (metres, seconds, kilograms, …);
 *    note the unit in a comment on each value.
 *  - Layout / chrome values are in screen pixels.
 *  - Colour strings live in ElectricFieldMapperColors.ts, not here.
 *  - Computed expressions (e.g. `2 * Math.PI`) may stay inline.
 *
 */

import ElectricFieldMapperNamespace from "./ElectricFieldMapperNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/**
 * Scenery-phet's InfoButton is large beside Reset All. Draw it at half of that size.
 */
export const INFO_BUTTON_SCALE = 0.5;

/**
 * Pointer-area dilation for the information button, in its local pixels.
 * At {@link INFO_BUTTON_SCALE} this keeps about the same on-screen slop as InfoButton's default of 10.
 */
export const INFO_BUTTON_POINTER_AREA_DILATION = 20;

/** Gap between the information button and Reset All (screen pixels). */
export const INFO_RESET_BUTTON_SPACING = 12;

/** Line-wrap width of the field-lines information dialog (screen pixels). */
export const INFO_DIALOG_LINE_WRAP = 440;

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

/** Distance between adjacent grid lines and charge snap points (metres). */
export const GRID_SPACING_M = 0.5;

/** Minor grid lines drawn per major grid line spacing, as in Charges and Fields. */
export const GRID_MINOR_LINES_PER_MAJOR = 5;

ElectricFieldMapperNamespace.register("ElectricFieldMapperConstants", {
  SCREEN_VIEW_MARGIN,
  INFO_BUTTON_SCALE,
  INFO_BUTTON_POINTER_AREA_DILATION,
  INFO_RESET_BUTTON_SPACING,
  INFO_DIALOG_LINE_WRAP,
  PANEL_CORNER_RADIUS,
  CHARGE_TOOLBOX_WIDTH,
  CHARGE_TOOLBOX_HEIGHT,
  CHARGE_TOOLBOX_ICON_INSET,
  CHARGE_TOOLBOX_ICON_Y,
  CHARGE_VIEW_RADIUS,
  FIELD_SENSOR_VIEW_RADIUS,
  VOLTMETER_CROSSHAIR_RADIUS,
  GRID_SPACING_M,
  GRID_MINOR_LINES_PER_MAJOR,
});
