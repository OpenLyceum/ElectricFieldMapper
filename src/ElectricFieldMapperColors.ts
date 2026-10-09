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
  // ── Charges (shaded spheres, as in PhET's Charges and Fields) ────────────────
  positiveChargeColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "positiveCharge", {
    default: "rgb(245,60,44)",
    projector: "rgb(245,60,44)",
  }),
  positiveChargeHighlightColorProperty: new ProfileColorProperty(
    ElectricFieldMapperNamespace,
    "positiveChargeHighlight",
    { default: "rgb(255,43,79)", projector: "rgb(255,43,79)" },
  ),
  positiveChargeEdgeColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "positiveChargeEdge", {
    default: "rgb(232,9,0)",
    projector: "rgb(232,9,0)",
  }),
  negativeChargeColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "negativeCharge", {
    default: "rgb(44,190,245)",
    projector: "rgb(44,190,245)",
  }),
  negativeChargeHighlightColorProperty: new ProfileColorProperty(
    ElectricFieldMapperNamespace,
    "negativeChargeHighlight",
    { default: "rgb(79,207,255)", projector: "rgb(79,207,255)" },
  ),
  negativeChargeEdgeColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "negativeChargeEdge", {
    default: "rgb(0,169,232)",
    projector: "rgb(0,169,232)",
  }),
  /** The + and − signs drawn on the charge spheres. */
  chargeSignColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "chargeSign", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  // ── Electric field sensors ───────────────────────────────────────────────────
  fieldSensorFillColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "fieldSensorFill", {
    default: "rgb(255,255,0)",
    projector: "rgb(255,153,0)",
  }),
  fieldSensorStrokeColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "fieldSensorStroke", {
    default: "rgb(128,120,133)",
    projector: "#000000",
  }),
  fieldSensorArrowColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "fieldSensorArrow", {
    default: "rgb(255,0,0)",
    projector: "rgb(255,0,0)",
  }),
  fieldSensorLabelColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "fieldSensorLabel", {
    default: "rgb(229,229,126)",
    projector: "#000000",
  }),

  // ── Voltage map, voltmeter, and equipotentials ──────────────────────────────
  /** Fully saturated colour for positive potential on the voltage map. */
  potentialPositiveColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "potentialPositive", {
    default: "rgb(210,0,0)",
    projector: "rgb(210,0,0)",
  }),
  /** Fully saturated colour for negative potential on the voltage map. */
  potentialNegativeColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "potentialNegative", {
    default: "rgb(0,0,255)",
    projector: "rgb(0,0,255)",
  }),
  equipotentialLineColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "equipotentialLine", {
    default: "rgb(50,255,100)",
    projector: "#000000",
  }),
  voltmeterCrosshairColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "voltmeterCrosshair", {
    default: "#ffffff",
    projector: "#000000",
  }),
  voltmeterBodyColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "voltmeterBody", {
    default: "#5b6270",
    projector: "#5b6270",
  }),
  voltmeterBodyStrokeColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "voltmeterBodyStroke", {
    default: "#c8ccd4",
    projector: "#30343c",
  }),
  voltmeterTitleColorProperty: new ProfileColorProperty(ElectricFieldMapperNamespace, "voltmeterTitle", {
    default: "#ffffff",
    projector: "#ffffff",
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

  /**
   * Hover and keyboard highlight on a light combo-box list.
   * Darker than the white list so the current row is obvious, and still light enough
   * for {@link controlSurfaceTextColorProperty}.
   */
  controlSurfaceHighlightColorProperty: new ProfileColorProperty(
    ElectricFieldMapperNamespace,
    "controlSurfaceHighlight",
    {
      default: "#a6d8f5",
      projector: "#a6d8f5",
    },
  ),
};

export default ElectricFieldMapperColors;
