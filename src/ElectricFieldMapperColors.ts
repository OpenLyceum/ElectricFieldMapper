/**
 * ElectricFieldMapperColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used in standard (dark) mode
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import ElectricFieldMapperColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import ElectricFieldMapperColors from "../../ElectricFieldMapperColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: ElectricFieldMapperColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the ElectricFieldMapperColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import ElectricFieldMapperNamespace from "./ElectricFieldMapperNamespace.js";

const ElectricFieldMapperColors = {
  /**
   * Background color for the simulation screen.
   * Deep navy in default mode; white in projector mode.
   */
  backgroundColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "background", {
    default: "#1a1a2e",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Deep blue in default mode; light gray in projector mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "panelBackground", {
    default: "#16213e",
    projector: "#f5f5f5",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Teal-navy in default mode; medium gray in projector mode.
   */
  panelBorderColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "panelBorder", {
    default: "#0f3460",
    projector: "#999999",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Near-white in default mode; near-black in projector mode.
   */
  textColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "text", {
    default: "#e0e0e0",
    projector: "#1a1a1a",
  }),

  playAreaColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "playArea", {
    default: "#101d35",
    projector: "#f8fbff",
  }),
  fieldArrowColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "fieldArrow", {
    default: "#82c9ef",
    projector: "#286597",
  }),
  fieldLineColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "fieldLine", {
    default: "#f5ca66",
    projector: "#a66806",
  }),

  gridColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "grid", {
    default: "#8598ad",
    projector: "#617083",
  }),
  positiveChargeColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "positiveCharge", {
    default: "#e65a65",
    projector: "#c22636",
  }),
  negativeChargeColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "negativeCharge", {
    default: "#4c78e9",
    projector: "#2555bf",
  }),
  chargeOutlineColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "chargeOutline", {
    default: "#ffffff",
    projector: "#202a40",
  }),
  probeColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "probe", {
    default: "#f5cc54",
    projector: "#f0ba32",
  }),
  probeDetailColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "probeDetail", {
    default: "#603c0e",
    projector: "#402500",
  }),

  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(
    ElectricFieldMapperNamespace,
    "controlSurfaceDisabled",
    {
      default: "#cccccc",
      projector: "#cccccc",
    },
  ),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),
};

export default ElectricFieldMapperColors;
