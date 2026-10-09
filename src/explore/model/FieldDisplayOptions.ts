import type { TReadOnlyProperty } from "scenerystack/axon";

/** Voltage-map full-scale choices. `auto` picks a scale from the charges on the visible board. */
export const VOLTAGE_SCALES = ["10", "40", "200", "auto"] as const;
export type VoltageScale = (typeof VOLTAGE_SCALES)[number];

/** How sampled field arrows turn a physical magnitude into a drawn length. */
export const ARROW_SCALES = ["direction", "compressed", "linear"] as const;
export type ArrowScale = (typeof ARROW_SCALES)[number];

/**
 * Automatic field lines launched per nanocoulomb at each charge.
 * The count is illustrative; it is not a flux measurement.
 */
export const LINES_PER_NANOCOULOMB = [8, 12, 16, 24] as const;
export type LinesPerNanocoulomb = (typeof LINES_PER_NANOCOULOMB)[number];

/** Preferences that change how the field is drawn and survive Reset All. */
export type FieldDisplayPreferences = {
  readonly linesPerNanocoulombProperty: TReadOnlyProperty<number>;
  readonly voltageScaleProperty: TReadOnlyProperty<string>;
  readonly arrowScaleProperty: TReadOnlyProperty<string>;
  readonly fieldLineArrowheadsProperty: TReadOnlyProperty<boolean>;
  readonly showFieldZerosProperty: TReadOnlyProperty<boolean>;
};

export function isVoltageScale(value: string): value is VoltageScale {
  return (VOLTAGE_SCALES as readonly string[]).includes(value);
}

export function isArrowScale(value: string): value is ArrowScale {
  return (ARROW_SCALES as readonly string[]).includes(value);
}

export function asVoltageScale(value: string): VoltageScale {
  return isVoltageScale(value) ? value : "40";
}

export function asArrowScale(value: string): ArrowScale {
  return isArrowScale(value) ? value : "compressed";
}
