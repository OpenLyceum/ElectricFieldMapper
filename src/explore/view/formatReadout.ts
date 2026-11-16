import { toFixed } from "scenerystack/dot";
import { FORMAT_READOUT_SETTINGS } from "../../ElectricFieldMapperConstants.js";

/**
 * Formats a meter reading with about `digits` significant figures, as Charges and Fields does:
 * large readings drop decimals, small readings keep them.
 */
export function formatSignificant(value: number, digits: number = FORMAT_READOUT_SETTINGS.DEFAULT_DIGITS): string {
  if (Number.isNaN(value)) {
    return "–";
  }
  if (!Number.isFinite(value)) {
    return value > 0 ? "∞" : "−∞";
  }
  const exponent = value === 0 ? 0 : Math.floor(Math.log10(Math.abs(value)));
  const decimals = Math.max(0, Math.min(digits, digits - 1 - exponent));
  return toFixed(value, decimals).replace("-", "−");
}
