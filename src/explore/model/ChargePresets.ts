import type { Point } from "./FieldPhysics.js";

/** Values accepted by the configuration combo box and the `preset` query parameter. */
export const CHARGE_PRESET_VALUES = [
  "custom",
  "dipole",
  "likePair",
  "line",
  "alternatingLine",
  "square",
  "quadrupole",
  "parallelPlates",
] as const;

export type ChargePreset = (typeof CHARGE_PRESET_VALUES)[number];

export function isChargePreset(value: string | null): value is ChargePreset {
  return value !== null && (CHARGE_PRESET_VALUES as readonly string[]).includes(value);
}

export type PresetCharge = Point & { q: 1 | -1 };

/** Small, grid-aligned examples that leave room to drag each charge on the board. */
export const CHARGE_PRESETS: Record<Exclude<ChargePreset, "custom">, readonly PresetCharge[]> = {
  dipole: [
    { q: 1, x: -1.5, y: 0 },
    { q: -1, x: 1.5, y: 0 },
  ],
  likePair: [
    { q: 1, x: -1.5, y: 0 },
    { q: 1, x: 1.5, y: 0 },
  ],
  line: [-2, -1, 0, 1, 2].map((x) => ({ q: 1 as const, x, y: 0 })),
  alternatingLine: [-2, -1, 0, 1, 2].map((x, i) => ({ q: (i % 2 === 0 ? 1 : -1) as 1 | -1, x, y: 0 })),
  square: [
    { q: 1, x: -1.5, y: -1.5 },
    { q: 1, x: 1.5, y: -1.5 },
    { q: 1, x: -1.5, y: 1.5 },
    { q: 1, x: 1.5, y: 1.5 },
  ],
  quadrupole: [
    { q: 1, x: -1.5, y: -1.5 },
    { q: -1, x: 1.5, y: -1.5 },
    { q: -1, x: -1.5, y: 1.5 },
    { q: 1, x: 1.5, y: 1.5 },
  ],
  parallelPlates: [-1, 0, 1].flatMap((y) => [
    { q: 1 as const, x: -1.5, y },
    { q: -1 as const, x: 1.5, y },
  ]),
};
