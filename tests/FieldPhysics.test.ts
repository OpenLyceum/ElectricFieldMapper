import { describe, expect, it } from "vitest";
import { FIELD_BOUNDS } from "../src/explore/model/ExploreModel.js";
import {
  automaticFieldLines,
  electricField,
  electricPotential,
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
