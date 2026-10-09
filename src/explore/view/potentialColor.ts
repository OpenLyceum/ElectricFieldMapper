import type { Color } from "scenerystack/scenery";
import ElectricFieldMapperColors from "../../ElectricFieldMapperColors.js";
import { POTENTIAL_SATURATION, potentialColorFraction } from "../model/FieldPhysics.js";

/**
 * Voltage-map colour for a potential: the play-area colour at 0 V, blending to red for positive
 * and blue for negative potential, as in Charges and Fields. `saturation` is the potential at
 * which the colour is fully red or blue.
 */
export function potentialRGB(
  potential: number,
  zero: Color,
  positive: Color,
  negative: Color,
  saturation = POTENTIAL_SATURATION,
): [number, number, number] {
  const fraction = potentialColorFraction(potential, saturation);
  const extreme = fraction >= 0 ? positive : negative;
  const t = Math.abs(fraction);
  return [zero.r + (extreme.r - zero.r) * t, zero.g + (extreme.g - zero.g) * t, zero.b + (extreme.b - zero.b) * t];
}

/** CSS colour for a potential using the current colour profile. */
export function potentialCSS(potential: number, alpha = 1, saturation = POTENTIAL_SATURATION): string {
  const [r, g, b] = potentialRGB(
    potential,
    ElectricFieldMapperColors.playAreaColorProperty.value,
    ElectricFieldMapperColors.potentialPositiveColorProperty.value,
    ElectricFieldMapperColors.potentialNegativeColorProperty.value,
    saturation,
  );
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${alpha})`;
}
