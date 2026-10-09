import { describe, expect, it } from "vitest";
import { CHARGE_PRESETS } from "../src/explore/model/ChargePresets.js";
import { FIELD_BOUNDS } from "../src/explore/model/ExploreModel.js";
import {
  automaticFieldLines,
  electricField,
  electricPotential,
  findFieldZeros,
  POTENTIAL_SATURATION,
  potentialColorFraction,
  potentialSaturation,
  traceEquipotential,
  traceFieldLine,
} from "../src/explore/model/FieldPhysics.js";

const dipole = [
  { x: -1, y: 0, q: 1 },
  { x: 1, y: 0, q: -1 },
] as const;

const nearCharge = (point: { x: number; y: number } | undefined, charge: { x: number; y: number }): boolean =>
  !!point && Math.hypot(point.x - charge.x, point.y - charge.y) < 0.3;

describe("electrostatic field", () => {
  it("obeys superposition and points from positive to negative charge", () => {
    const e = electricField(dipole, { x: 0, y: 0 });
    expect(e.x).toBeCloseTo(2 * 8.9875517923, 8);
    expect(e.y).toBeCloseTo(0, 8);
    expect(electricPotential(dipole, { x: 0, y: 0 })).toBeCloseTo(0, 8);
  });

  it("returns an undefined field at a point charge and finite values elsewhere", () => {
    expect(Number.isNaN(electricField(dipole, { x: -1, y: 0 }).x)).toBe(true);
    expect(electricPotential(dipole, { x: -1, y: 0 })).toBe(Infinity);
    expect(electricField([], { x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
  });

  it.each([1, -1])("cancels coincident opposite charges with sign %i first", (sign) => {
    const charges = [
      { x: 0.5, y: -0.5, q: sign },
      { x: 0.5, y: -0.5, q: -sign },
    ];
    for (const point of [
      { x: 0.5, y: -0.5 },
      { x: 0.55, y: -0.5 },
      { x: 2, y: 1 },
    ]) {
      expect(electricField(charges, point)).toEqual({ x: 0, y: 0 });
      expect(electricPotential(charges, point)).toBe(0);
      expect(traceFieldLine(charges, point, FIELD_BOUNDS)).toEqual([]);
      expect(traceEquipotential(charges, point, FIELD_BOUNDS)).toEqual([]);
    }
    expect(automaticFieldLines(charges, FIELD_BOUNDS)).toEqual([]);
  });

  it("leaves another charge's field and lines unchanged by a cancelled pair", () => {
    const remainingCharge = { x: -1, y: 0, q: 1 };
    const remaining = [remainingCharge];
    const charges = [remainingCharge, { x: 0, y: 0, q: 1 }, { x: 0, y: 0, q: -1 }];
    for (const point of [
      { x: 0, y: 0 },
      { x: 0.05, y: 0 },
      { x: 2, y: 1 },
    ]) {
      expect(electricField(charges, point)).toEqual(electricField(remaining, point));
      expect(electricPotential(charges, point)).toBe(electricPotential(remaining, point));
    }
    expect(traceFieldLine(charges, { x: 0, y: 0 }, FIELD_BOUNDS)).toEqual(
      traceFieldLine(remaining, { x: 0, y: 0 }, FIELD_BOUNDS),
    );
    expect(automaticFieldLines(charges, FIELD_BOUNDS)).toEqual(automaticFieldLines(remaining, FIELD_BOUNDS));
  });

  it.each([1, -1])("treats unequal coincident charges as their net charge of %i nC", (sign) => {
    const charges = [
      { x: 0, y: 0, q: -sign },
      { x: 0, y: 0, q: 2 * sign },
    ];
    const net = [{ x: 0, y: 0, q: sign }];
    expect(electricField(charges, { x: 1, y: 0 })).toEqual(electricField(net, { x: 1, y: 0 }));
    expect(electricPotential(charges, { x: 0, y: 0 })).toBe(sign * Infinity);
    expect(Number.isNaN(electricField(charges, { x: 0, y: 0 }).x)).toBe(true);
    expect(automaticFieldLines(charges, FIELD_BOUNDS)).toEqual(automaticFieldLines(net, FIELD_BOUNDS));
  });

  it("preserves the field of opposite charges at distinct nearby positions", () => {
    const charges = [
      { x: 0, y: 0, q: 1 },
      { x: 0.001, y: 0, q: -1 },
    ];
    expect(Math.abs(electricField(charges, { x: 1, y: 0 }).x)).toBeGreaterThan(0);
    expect(Math.abs(electricPotential(charges, { x: 1, y: 0 }))).toBeGreaterThan(0);
  });

  it("traces a smooth line through a dipole without escaping its bounds", () => {
    const line = traceFieldLine(dipole, { x: 0, y: 0.2 }, FIELD_BOUNDS);
    expect(line.length).toBeGreaterThan(10);
    expect(line.some((p) => Math.abs(p.x) < 1e-9 && Math.abs(p.y - 0.2) < 1e-9)).toBe(true);
    expect(line.every((p) => Number.isFinite(p.x + p.y))).toBe(true);
    expect(line.length).toBeLessThanOrEqual(1801);
  });

  it("ends field lines at a zero between like charges without veering off the axis", () => {
    const angle = 0.6;
    const axis = { x: Math.cos(angle), y: Math.sin(angle) };
    const centre = { x: 0.4, y: -0.3 };
    const smallCharge = { x: centre.x - 1.5 * axis.x, y: centre.y - 1.5 * axis.y, q: 1 };
    const largeCharge = { x: centre.x + 1.5 * axis.x, y: centre.y + 1.5 * axis.y, q: 4 };
    const charges = [smallCharge, largeCharge];
    // The null is one metre from the smaller charge, toward the larger one.
    const nullPoint = { x: smallCharge.x + axis.x, y: smallCharge.y + axis.y };
    for (const [charge, sign] of [
      [smallCharge, 1],
      [largeCharge, -1],
    ] as const) {
      const seed = {
        x: charge.x + sign * 0.18 * axis.x - 1e-12 * axis.y,
        y: charge.y + sign * 0.18 * axis.y + 1e-12 * axis.x,
      };
      const line = traceFieldLine(charges, seed, FIELD_BOUNDS);
      const end = line.at(-1);
      expect(line.length).toBeGreaterThan(10);
      expect(end).toBeDefined();
      expect(Math.hypot((end?.x ?? 0) - nullPoint.x, (end?.y ?? 0) - nullPoint.y)).toBeLessThan(0.004);
      expect(line.every((p) => Math.abs((p.x - centre.x) * axis.y - (p.y - centre.y) * axis.x) < 1e-4)).toBe(true);
    }
  });

  it.each(
    [12, 20].flatMap((count) =>
      [1, -1].flatMap((sign) => [0, 0.6, Math.PI / 2].map((angle) => ({ count, sign, angle }))),
    ),
  )("connects like-charge lines to the edge at density $count, sign $sign, angle $angle", ({ count, sign, angle }) => {
    const centre = { x: 0.4, y: -0.3 };
    const axis = { x: Math.cos(angle), y: Math.sin(angle) };
    const charges = [-1, 1].map((side) => ({
      x: centre.x + side * 1.5 * axis.x,
      y: centre.y + side * 1.5 * axis.y,
      q: sign,
    }));
    const lines = automaticFieldLines(charges, FIELD_BOUNDS, count);
    expect(lines).toHaveLength(2 * count);
    for (const charge of charges) {
      const attached = lines.filter((line) => nearCharge(sign > 0 ? line[0] : line.at(-1), charge));
      expect(attached).toHaveLength(count);
      const central = attached.filter((line) => line.some((p) => Math.hypot(p.x - centre.x, p.y - centre.y) < 0.025));
      expect(central).toHaveLength(2);
      const sides = central.map((line) => {
        const closest = line.reduce((a, b) =>
          Math.hypot(a.x - centre.x, a.y - centre.y) < Math.hypot(b.x - centre.x, b.y - centre.y) ? a : b,
        );
        return Math.sign(-(closest.x - centre.x) * axis.y + (closest.y - centre.y) * axis.x);
      });
      expect(sides.sort((a, b) => a - b)).toEqual([-1, 1]);
    }
    for (const line of lines) {
      const farEnd = sign > 0 ? line.at(-1) : line[0];
      expect(farEnd).toBeDefined();
      if (!farEnd) {
        continue;
      }
      expect(
        farEnd.x < FIELD_BOUNDS.minX ||
          farEnd.x > FIELD_BOUNDS.maxX ||
          farEnd.y < FIELD_BOUNDS.minY ||
          farEnd.y > FIELD_BOUNDS.maxY,
      ).toBe(true);
      for (let i = 1; i < line.length; i++) {
        const a = line[i - 1];
        const b = line[i];
        if (a && b) {
          const field = electricField(charges, a);
          expect((b.x - a.x) * field.x + (b.y - a.y) * field.y).toBeGreaterThan(0);
        }
      }
    }
  });

  it("bends nearby off-axis lines around the null with reflection symmetry", () => {
    const charges = [
      { x: -1.5, y: 0, q: 1 },
      { x: 1.5, y: 0, q: 1 },
    ];
    const upper = traceFieldLine(charges, { x: -1.32, y: -0.02 }, FIELD_BOUNDS);
    const lower = traceFieldLine(charges, { x: -1.32, y: 0.02 }, FIELD_BOUNDS);
    expect(upper.at(-1)?.y).toBeLessThan(FIELD_BOUNDS.minY);
    expect(lower.at(-1)?.y).toBeGreaterThan(FIELD_BOUNDS.maxY);
    expect(upper).toEqual(lower.map((p) => ({ x: p.x, y: -p.y })));
    expect(upper.every((p) => p.x < 0 && p.y < 0)).toBe(true);
  });

  it("generates automatic lines for a single negative charge", () => {
    expect(automaticFieldLines([{ x: 0, y: 0, q: -1 }], FIELD_BOUNDS)).toHaveLength(12);
  });

  it.each([12, 20])("balances dipole lines and draws incoming lines from the edge at density %i", (count) => {
    const lines = automaticFieldLines(dipole, FIELD_BOUNDS, count);
    expect(lines.filter((line) => nearCharge(line[0], dipole[0]))).toHaveLength(count);
    expect(lines.filter((line) => nearCharge(line.at(-1), dipole[1]))).toHaveLength(count);
    expect(lines.some((line) => !nearCharge(line[0], dipole[0]) && nearCharge(line.at(-1), dipole[1]))).toBe(true);
  });

  it.each([
    [2, -1, 24, 12],
    [1, -2, 12, 24],
  ])("scales lines with charge magnitudes %i and %i", (positive, negative, sourceCount, sinkCount) => {
    const charges = [
      { x: -1.5, y: 0, q: positive },
      { x: 1.5, y: 0, q: negative },
    ];
    const lines = automaticFieldLines(charges, FIELD_BOUNDS);
    expect(lines.filter((line) => nearCharge(line[0], { x: -1.5, y: 0 }))).toHaveLength(sourceCount);
    expect(lines.filter((line) => nearCharge(line.at(-1), { x: 1.5, y: 0 }))).toHaveLength(sinkCount);
  });
});

describe("equipotentials and the voltage map", () => {
  it("closes a circle of constant potential around a single charge", () => {
    const single = [{ x: 0, y: 0, q: 1 }];
    const line = traceEquipotential(single, { x: 1, y: 0 }, FIELD_BOUNDS);
    expect(line.length).toBeGreaterThan(50);
    expect(line[0]).toEqual(line[line.length - 1]);
    for (const p of line) {
      expect(Math.hypot(p.x, p.y)).toBeCloseTo(1, 3);
    }
  });

  it("keeps the dipole midplane at zero volts and runs off the board", () => {
    const line = traceEquipotential(dipole, { x: 0, y: 0.5 }, FIELD_BOUNDS);
    for (const p of line) {
      expect(electricPotential(dipole, p)).toBeCloseTo(0, 6);
    }
    const ys = line.map((p) => p.y);
    expect(Math.min(...ys)).toBeLessThan(FIELD_BOUNDS.minY + 0.1);
    expect(Math.max(...ys)).toBeGreaterThan(FIELD_BOUNDS.maxY - 0.1);
  });

  it("holds an off-centre dipole level within a millivolt", () => {
    const seed = { x: -0.4, y: 0.3 };
    const target = electricPotential(dipole, seed);
    for (const p of traceEquipotential(dipole, seed, FIELD_BOUNDS)) {
      expect(Math.abs(electricPotential(dipole, p) - target)).toBeLessThan(1e-3);
    }
  });

  it("maps potential to a clamped signed colour fraction", () => {
    expect(potentialColorFraction(0)).toBe(0);
    expect(potentialColorFraction(POTENTIAL_SATURATION / 2)).toBeCloseTo(0.5);
    expect(potentialColorFraction(-4 * POTENTIAL_SATURATION)).toBe(-1);
    expect(potentialColorFraction(Infinity)).toBe(1);
    expect(potentialColorFraction(Number.NaN)).toBe(0);
    expect(potentialColorFraction(10, 10)).toBe(1);
    expect(potentialColorFraction(10, 40)).toBeCloseTo(0.25);
    expect(potentialColorFraction(10, 0)).toBe(0);
  });

  it("uses a fixed voltage scale, and a tighter automatic scale for one charge", () => {
    const charge = [{ x: 0, y: 0, q: 1 }];
    expect(potentialSaturation("10", charge, FIELD_BOUNDS)).toBe(10);
    expect(potentialSaturation("40", charge, FIELD_BOUNDS)).toBe(40);
    expect(potentialSaturation("200", charge, FIELD_BOUNDS)).toBe(200);
    expect(potentialSaturation("auto", [], FIELD_BOUNDS)).toBe(POTENTIAL_SATURATION);
    const single = potentialSaturation("auto", charge, FIELD_BOUNDS);
    const plates = potentialSaturation("auto", CHARGE_PRESETS.parallelPlates, FIELD_BOUNDS);
    expect(single).toBeGreaterThanOrEqual(5);
    expect(single).toBeLessThan(POTENTIAL_SATURATION);
    expect(plates).toBeGreaterThan(single);
    expect(plates).toBeLessThanOrEqual(500);
  });

  it("marks isolated field zeros and leaves a dipole unmarked", () => {
    const includesOrigin = (points: { x: number; y: number }[]) =>
      points.some((point) => Math.hypot(point.x, point.y) < 1e-3);
    const expectRealZeros = (
      charges: readonly { x: number; y: number; q: number }[],
      points: { x: number; y: number }[],
    ) => {
      expect(points.length).toBeGreaterThan(0);
      for (const zero of points) {
        const field = electricField(charges, zero);
        expect(Math.hypot(field.x, field.y)).toBeLessThan(1e-3);
        for (const charge of charges) {
          expect(Math.hypot(zero.x - charge.x, zero.y - charge.y)).toBeGreaterThan(0.2);
        }
      }
    };
    expect(findFieldZeros(dipole, FIELD_BOUNDS)).toEqual([]);
    expect(findFieldZeros([{ x: 0, y: 0, q: 1 }], FIELD_BOUNDS)).toEqual([]);
    const likePair = findFieldZeros(CHARGE_PRESETS.likePair, FIELD_BOUNDS);
    expect(likePair).toHaveLength(1);
    expect(includesOrigin(likePair)).toBe(true);
    const square = findFieldZeros(CHARGE_PRESETS.square, FIELD_BOUNDS);
    expect(square).toHaveLength(5);
    expect(includesOrigin(square)).toBe(true);
    expectRealZeros(CHARGE_PRESETS.square, square);
    const quadrupole = findFieldZeros(CHARGE_PRESETS.quadrupole, FIELD_BOUNDS);
    expect(quadrupole).toHaveLength(1);
    expect(includesOrigin(quadrupole)).toBe(true);
    const alternating = findFieldZeros(CHARGE_PRESETS.alternatingLine, FIELD_BOUNDS);
    expect(alternating).toHaveLength(4);
    expectRealZeros(CHARGE_PRESETS.alternatingLine, alternating);
  });
});
