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

/** Settings for common/ElectricFieldMapperControlOptions.ts. */
export const ELECTRIC_FIELD_MAPPER_CONTROL_OPTIONS_SETTINGS = {
  /** Slider thumb size width (px). */
  SLIDER_THUMB_SIZE_WIDTH: 12,
  /** Slider thumb size height (px). */
  SLIDER_THUMB_SIZE_HEIGHT: 22,
  /** Standalone slider track size width (px). */
  STANDALONE_SLIDER_TRACK_SIZE_WIDTH: 150,
  /** Standalone slider track size height (px). */
  STANDALONE_SLIDER_TRACK_SIZE_HEIGHT: 3,
  /** Number control slider track size width (px). */
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_WIDTH: 110,
  /** Number control slider track size height (px). */
  NUMBER_CONTROL_SLIDER_TRACK_SIZE_HEIGHT: 3,
  /** Checkbox box width (px). */
  CHECKBOX_BOX_WIDTH: 16,
  /** Electric field mapper number control options scale (dimensionless). */
  ELECTRIC_FIELD_MAPPER_NUMBER_CONTROL_OPTIONS_SCALE: 0.75,
  /** Electric field mapper number control options slider padding (px). */
  ELECTRIC_FIELD_MAPPER_NUMBER_CONTROL_OPTIONS_SLIDER_PADDING: 4,
  /** Electric field mapper number control options arrow button spacing (px). */
  ELECTRIC_FIELD_MAPPER_NUMBER_CONTROL_OPTIONS_ARROW_BUTTON_SPACING: 3,
  /** Electric field mapper number control options vertical spacing (px). */
  ELECTRIC_FIELD_MAPPER_NUMBER_CONTROL_OPTIONS_VERTICAL_SPACING: 4,
  /** Electric field mapper checkbox options spacing (px). */
  ELECTRIC_FIELD_MAPPER_CHECKBOX_OPTIONS_SPACING: 4,
} as const;

/** Settings for common/ElectricFieldMapperPanel.ts. */
export const ELECTRIC_FIELD_MAPPER_PANEL_SETTINGS = {
  /** Options x margin (px). */
  OPTIONS_X_MARGIN: 12,
  /** Options y margin (px). */
  OPTIONS_Y_MARGIN: 10,
} as const;

/** Settings for common/ElectricFieldMapperScreenIcons.ts. */
export const ELECTRIC_FIELD_MAPPER_SCREEN_ICONS_SETTINGS = {
  CREATE_EXPLORE_ICON_CENTER_Y_OFFSET: 186, // px
  CREATE_EXPLORE_ICON_CENTER_Y_FACTOR: 0.35, // dimensionless

  CREATE_EXPLORE_ICON_CENTER_X_VARIANT_2: 174, // px
  CREATE_EXPLORE_ICON_CENTER_X_VARIANT_3: 374, // px

  /** Width (px). */
  WIDTH: 548,
  /** Height (px). */
  HEIGHT: 373,
  /** Create explore icon start x (px). */
  CREATE_EXPLORE_ICON_START_X: 182,
  /** Create explore icon end x (px). */
  CREATE_EXPLORE_ICON_END_X: 366,
  /** Create explore icon line width (px). */
  CREATE_EXPLORE_ICON_LINE_WIDTH: 3,
  /** Create explore icon center x (px). */
  CREATE_EXPLORE_ICON_CENTER_X: 274,
  /** Create explore icon center y (px). */
  CREATE_EXPLORE_ICON_CENTER_Y: 186,
} as const;

/** Settings for explore/model/ExploreModel.ts. */
export const EXPLORE_MODEL_SETTINGS = {
  /** Charge hit radius relative to its physical mask radius (dimensionless). */
  CHARGE_PICK_RADIUS_FACTOR: 1.3,
  /** Initial voltmeter y coordinate (m). */
  VOLTMETER_INITIAL_Y: 1.55,
  /** Distance keyboard drags keep from the edge of the field (metres). */
  KEYBOARD_DRAG_MARGIN: 0.18,
  /** Lines per nanocoulomb default (lines/nC). */
  LINES_PER_NANOCOULOMB_DEFAULT: 12,
} as const;

/** Settings for explore/model/FieldPhysics.ts. */
export const FIELD_PHYSICS_SETTINGS = {
  /** Maximum Newton iterations used to refine an electric-field zero (count). */
  FIELD_ZERO_NEWTON_ITERATIONS: 16,
  /** Angularly staggered passes when seeding incoming lines (count). */
  INCOMING_SEED_PASSES: 4,
  /** Smallest electric field magnitude used to define a tracing direction (V/m). */
  MIN_FIELD_MAGNITUDE: 1e-9,
  /** Initial field-line step length (m). */
  INITIAL_TRACE_STEP: 0.035,
  /** Maximum RK4 steps per field line (count). */
  MAX_TRACE_STEPS: 900,
  /** Stopping radius relative to the charge mask (dimensionless). */
  CHARGE_STOP_RADIUS_FACTOR: 0.95,
  /** Direction-change threshold for reducing the trace step (rad). */
  SHARP_TURN_THRESHOLD: 0.1,
  /** Minimum field-line step length (m). */
  MIN_TRACE_STEP: 0.012,
  /** Multiplier when a sharp turn requires a smaller step (dimensionless). */
  TRACE_STEP_SHRINK_FACTOR: 0.6,
  /** Direction-change threshold for growing the trace step (rad). */
  SMALL_TURN_THRESHOLD: 0.025,
  /** Maximum field-line step length (m). */
  MAX_TRACE_STEP: 0.1,
  /** Multiplier when a nearly straight line permits a larger step (dimensionless). */
  TRACE_STEP_GROWTH_FACTOR: 1.15,
  /** Maximum step relative to the nearest charge distance (dimensionless). */
  NEAREST_CHARGE_STEP_FRACTION: 0.38,
  /** Minimum advance before terminating a stalled field line (m). */
  MIN_TRACE_DISPLACEMENT: 1e-8,
  /** Radius of the seed ring around a charge (m). */
  CHARGE_SEED_RADIUS: 0.18,
  /** Minimum squared electric field for equipotential projection ((V/m)²). */
  MIN_PROJECTION_FIELD_SQUARED: 1e-12,
  /** Equipotential RK4 step length (m). */
  EQUIPOTENTIAL_STEP: 0.03,
  /** Closure distance relative to the equipotential step (dimensionless). */
  LOOP_CLOSURE_STEP_FRACTION: 0.75,
  /** Minimum absolute field Jacobian determinant in the field-zero solve (V²/m⁴). */
  NEWTON_DETERMINANT_TOLERANCE: 1e-8,
  /** Inset of corner seeds for finding electric-field zeros (m). */
  FIELD_ZERO_SEED_INSET: 0.4,
  /** K nc (V·m/nC). */
  K_NC: 8.9875517923,
  /** Charge radius (m). */
  CHARGE_RADIUS: 0.15,
  /** Field null stop scale (m). */
  FIELD_NULL_STOP_SCALE: 0.002,
  /** Field null step fraction (dimensionless). */
  FIELD_NULL_STEP_FRACTION: 0.45,
  /** Default count (count). */
  DEFAULT_COUNT: 12,
  /** Potential saturation (V). */
  POTENTIAL_SATURATION: 40,
  /** Coarse spacing used to choose an automatic voltage scale from the visible board. */
  AUTO_SATURATION_SAMPLE_M: 0.25,
  /** Share of board samples allowed to sit at full red or blue under the automatic scale. */
  AUTO_SATURATION_PERCENTILE: 0.9,
  /** Auto saturation min (V). */
  AUTO_SATURATION_MIN: 5,
  /** Auto saturation max (V). */
  AUTO_SATURATION_MAX: 500,
  /** Grid spacing for the field-zero search (metres). */
  FIELD_ZERO_GRID_M: 0.5,
  /** A refined point counts as a zero when |E| is below this (V/m). */
  FIELD_ZERO_RESIDUAL: 1e-4,
  /** Zeros closer than this are the same point (metres). */
  FIELD_ZERO_MERGE_M: 0.25,
  /** Field zero max step m (m). */
  FIELD_ZERO_MAX_STEP_M: 0.6,
  /** Field zero max travel m (m). */
  FIELD_ZERO_MAX_TRAVEL_M: 1.25,
} as const;

/** Settings for explore/view/ChargeNode.ts. */
export const CHARGE_NODE_SETTINGS = {
  DILATED_DILATION: 6, // px

  /** Keyboard movement per key press or repeat, in view pixels when snapping is off. */
  KEYBOARD_DRAG_DELTA: 10,
  /** Shift keyboard drag delta (control/model units). */
  SHIFT_KEYBOARD_DRAG_DELTA: 3,
} as const;

/** Settings for explore/view/ElectricFieldSensorNode.ts. */
export const ELECTRIC_FIELD_SENSOR_NODE_SETTINGS = {
  DILATED_DILATION: 10, // px

  /** Screen pixels of arrow per V/m, and the longest arrow drawn (near a charge the field grows without bound). */
  ARROW_PIXELS_PER_VOLT_PER_METRE: 12,
  /** Max arrow length (px). */
  MAX_ARROW_LENGTH: 300,
  /** Arrow head height (px). */
  ARROW_HEAD_HEIGHT: 10,
  /** Arrow head width (px). */
  ARROW_HEAD_WIDTH: 12,
  /** Arrow tail width (px). */
  ARROW_TAIL_WIDTH: 4,
} as const;

/** Settings for explore/view/ExploreScreenView.ts. */
export const EXPLORE_SCREEN_VIEW_SETTINGS = {
  NEXT_POSITION_X: 2.8, // px
  NEXT_POSITION_X_FACTOR: 0.35, // dimensionless
  NEXT_POSITION_Y_FACTOR: 0.2, // dimensionless
  CONSTRUCTOR_NEXT_POSITION_Y_FACTOR: 4, // dimensionless
  SENSOR_X_OFFSET: 0.2, // px
  CONSTRUCTOR_TOP_OFFSET: 6, // px
  CONSTRUCTOR_BOTTOM_OFFSET: 4, // px

  FINISH_SENSOR_DRAG_MARGIN: 0.1, // px
  VOLTMETER_MARGIN: 0.05, // px
  PANEL_ITEM_3_SPACING: 6, // px
  PANEL_ITEM_16_SPACING: 6, // px

  /** Origin view position x (px). */
  ORIGIN_VIEW_POSITION_X: 369,
  /** Origin view position y (px). */
  ORIGIN_VIEW_POSITION_Y: 284,
  /** View pixels per metre (px). */
  VIEW_PIXELS_PER_METRE: 83,
  /** Toolbox item top (px). */
  TOOLBOX_ITEM_TOP: 21,
  /** Toolbox item max width (px). */
  TOOLBOX_ITEM_MAX_WIDTH: 70,
  /** Constructor line width (px). */
  CONSTRUCTOR_LINE_WIDTH: 2,
  /** Constructor corner radius (px). */
  CONSTRUCTOR_CORNER_RADIUS: 5,
  /** Voltmeter icon scale (dimensionless). */
  VOLTMETER_ICON_SCALE: 0.6,
  /** Tape icon scale (dimensionless). */
  TAPE_ICON_SCALE: 0.8,
  /** Tools column spacing (px). */
  TOOLS_COLUMN_SPACING: 12,
  /** Top top (px). */
  TOP_TOP: 8,
  /** Button max width (px). */
  BUTTON_MAX_WIDTH: 200,
  /** Check max width (px). */
  CHECK_MAX_WIDTH: 190,
  /** Heading max width (px). */
  HEADING_MAX_WIDTH: 230,
  /** Panel spacing (px). */
  PANEL_SPACING: 5,
  /** Panel x margin (px). */
  PANEL_X_MARGIN: 12,
  /** Panel y margin (px). */
  PANEL_Y_MARGIN: 10,
} as const;

/** Settings for explore/view/FieldCanvasNode.ts. */
export const FIELD_CANVAS_NODE_SETTINGS = {
  DRAW_VECTORS_LINE_WIDTH: 1.6, // px
  DRAW_GRID_LINE_WIDTH: 1.6, // px
  DRAW_FIELD_ZEROS_LINE_WIDTH: 3.2, // px

  ARC_RADIUS: 1.5, // px

  /** Model metres per voltage-map cell; the coarse image is smoothed when scaled up. */
  VOLTAGE_CELL: 0.05,
  /** Spacing of the sampled field arrows (metres); samples sit midway between major grid lines. */
  VECTOR_SPACING: 0.5,
  /** Line width line width (px). */
  LINE_WIDTH_LINE_WIDTH: 1.8,
  /** Draw field zeros radius (px). */
  DRAW_FIELD_ZEROS_RADIUS: 6.5,
} as const;

/** Settings for explore/view/FieldLinesInfoDialog.ts. */
export const FIELD_LINES_INFO_DIALOG_SETTINGS = {
  /** Title font size (px). */
  TITLE_FONT_SIZE: 20,
  /** Body font size (px). */
  BODY_FONT_SIZE: 16,
} as const;

/** Settings for explore/view/GridScaleNode.ts. */
export const GRID_SCALE_NODE_SETTINGS = {
  LABEL_MAX_WIDTH_OFFSET: 24, // px

  /** Arrow position x (px). */
  ARROW_POSITION_X: 2,
  /** Arrow position y (px). */
  ARROW_POSITION_Y: 2.2,
} as const;

/** Settings for explore/view/VoltmeterNode.ts. */
export const VOLTMETER_NODE_SETTINGS = {
  BACKGROUND_TOP_FACTOR: 1.4, // dimensionless
  TITLE_MAX_WIDTH_OFFSET: 16, // px
  READOUT_MAX_WIDTH_OFFSET: 32, // px

  BODY_WIDTH_SEGMENT_2: 16, // px
  TIP_Y_SEGMENT_2: 3.5, // px
  LEAD_X_SEGMENT_2: -7, // px
  LEAD_Y_SEGMENT_2: 1.3, // px
  BODY_HEIGHT_SEGMENT_2: 22, // px

  /** Body width (px). */
  BODY_WIDTH: 112,
  /** Ring line width (px). */
  RING_LINE_WIDTH: 3,
  /** Background corner x (px). */
  BACKGROUND_CORNER_X: 8,
  /** Background corner y (px). */
  BACKGROUND_CORNER_Y: 8,
  /** Background line width (px). */
  BACKGROUND_LINE_WIDTH: 2,
  /** Body y (px). */
  BODY_Y: -3.5,
  /** Body height (px). */
  BODY_HEIGHT: 7,
  /** Eraser x (px). */
  ERASER_X: 16,
  /** Eraser y (px). */
  ERASER_Y: -3.5,
  /** Eraser width (px). */
  ERASER_WIDTH: 4,
  /** Eraser height (px). */
  ERASER_HEIGHT: 7,
  /** Tip y (px). */
  TIP_Y: -3.5,
  /** Tip x (px). */
  TIP_X: -7,
  /** Lead x (px). */
  LEAD_X: -4.5,
  /** Lead y (px). */
  LEAD_Y: -1.3,
  /** Body corner x (px). */
  BODY_CORNER_X: 4,
  /** Body corner y (px). */
  BODY_CORNER_Y: 4,
  /** Readout background height (px). */
  READOUT_BACKGROUND_HEIGHT: 22,
  /** Readout background corner x (px). */
  READOUT_BACKGROUND_CORNER_X: 4,
  /** Readout background corner y (px). */
  READOUT_BACKGROUND_CORNER_Y: 4,
  /** Plot button x margin (px). */
  PLOT_BUTTON_X_MARGIN: 8,
  /** Plot button y margin (px). */
  PLOT_BUTTON_Y_MARGIN: 5,
  /** Buttons spacing (px). */
  BUTTONS_SPACING: 10,
  /** Body spacing (px). */
  BODY_SPACING: 6,
} as const;

/** Settings for explore/view/arrowDisplay.ts. */
export const ARROW_DISPLAY_SETTINGS = {
  /** Linear arrow reference vm (px). */
  LINEAR_ARROW_REFERENCE_VM: 30,
  /** Linear arrow max length (count). */
  LINEAR_ARROW_MAX_LENGTH: 18,
  /** Linear arrow min length (px). */
  LINEAR_ARROW_MIN_LENGTH: 3,
  /** Arrow display opacity (dimensionless). */
  ARROW_DISPLAY_OPACITY: 0.9,
} as const;

/** Settings for explore/view/formatReadout.ts. */
export const FORMAT_READOUT_SETTINGS = {
  /** Default digits (digits). */
  DEFAULT_DIGITS: 3,
} as const;

/** Settings for preferences/ElectricFieldMapperPreferencesNode.ts. */
export const ELECTRIC_FIELD_MAPPER_PREFERENCES_NODE_SETTINGS = {
  ITEM_2_SPACING: 24, // px

  /** Column label width (px). */
  COLUMN_LABEL_WIDTH: 210,
  /** Choice font size (px). */
  CHOICE_FONT_SIZE: 14,
  /** Heading font size (px). */
  HEADING_FONT_SIZE: 16,
  /** Radio options spacing (px). */
  RADIO_OPTIONS_SPACING: 5,
  /** Section spacing (px). */
  SECTION_SPACING: 6,
  /** Column spacing (px). */
  COLUMN_SPACING: 14,
  /** Checkbox options spacing (px). */
  CHECKBOX_OPTIONS_SPACING: 8,
  /** Constructor spacing (px). */
  CONSTRUCTOR_SPACING: 14,
  /** Constructor font size (px). */
  CONSTRUCTOR_FONT_SIZE: 18,
} as const;

/** Component dimensions in px; ratios and control steps are dimensionless; precision counts digits. */
export const ELECTRIC_FIELD_MAPPER_QUERY_PARAMETERS_SETTINGS = {
  ELECTRIC_FIELD_MAPPER_QUERY_PARAMETERS_DEFAULT_VALUE: 12, // dimensionless
} as const;

/** Initial positions and dimensions for explore/model/ExploreModel.ts (m). */
export const EXPLORE_MODEL_COORDINATES = {
  MEASURING_TAPE_BASE_Y: 1.2, // m
  MEASURING_TAPE_TIP_Y: 1.2, // m
} as const;

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
