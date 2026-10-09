import type { ArrowScale } from "../model/FieldDisplayOptions.js";

/** Field strength (V/m) at which a clipped-linear arrow reaches its full length. */
export const LINEAR_ARROW_REFERENCE_VM = 30;

/** Pixel length of a clipped-linear arrow at or above {@link LINEAR_ARROW_REFERENCE_VM}. */
export const LINEAR_ARROW_MAX_LENGTH = 18;

/** Shortest clipped-linear arrow. Weaker samples stay this long so their direction remains visible. */
export const LINEAR_ARROW_MIN_LENGTH = 3;

/**
 * Pixel length and opacity for one sampled field arrow.
 * Direction-only arrows ignore magnitude. Compressed arrows use a logarithm.
 * Clipped-linear arrows grow with |E| until {@link LINEAR_ARROW_REFERENCE_VM}.
 */
export function arrowDisplay(magnitude: number, scale: ArrowScale): { length: number; opacity: number } {
  if (scale === "direction") {
    return { length: 14, opacity: 0.9 };
  }
  if (scale === "linear") {
    const fraction = Math.min(1, magnitude / LINEAR_ARROW_REFERENCE_VM);
    return {
      length: Math.max(LINEAR_ARROW_MIN_LENGTH, LINEAR_ARROW_MAX_LENGTH * fraction),
      opacity: 0.45 + 0.5 * fraction,
    };
  }
  const compressed = Math.log1p(magnitude) / 4;
  return {
    length: 4 + 12 * Math.min(1, compressed),
    opacity: Math.min(0.95, Math.max(0.2, compressed)),
  };
}
