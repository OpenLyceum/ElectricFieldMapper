import { describe, expect, it } from "vitest";
import { FIELD_BOUNDS } from "../src/explore/model/ExploreModel.js";
import {
  automaticFieldLines,
  electricField,
  electricPotential,
  POTENTIAL_SATURATION,
  potentialColorFraction,
  traceEquipotential,
  traceFieldLine,
} from "../src/explore/model/FieldPhysics.js";

const dipole = [
  { x: -1, y: 0, q: 1 },
  { x: 1, y: 0, q: -1 },
];

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

  it("traces a smooth line through a dipole without escaping its bounds", () => {
    const line = traceFieldLine(dipole, { x: 0, y: 0.2 }, FIELD_BOUNDS);
    expect(line.length).toBeGreaterThan(10);
    expect(line.some((p) => Math.abs(p.x) < 1e-9 && Math.abs(p.y - 0.2) < 1e-9)).toBe(true);
    expect(line.every((p) => Number.isFinite(p.x + p.y))).toBe(true);
    expect(line.length).toBeLessThanOrEqual(1801);
  });

  it("generates automatic lines for a single negative charge", () => {
    expect(automaticFieldLines([{ x: 0, y: 0, q: -1 }], FIELD_BOUNDS)).toHaveLength(12);
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
  });
});
