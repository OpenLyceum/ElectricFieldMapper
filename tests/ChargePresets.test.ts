import { describe, expect, it } from "vitest";
import { GRID_SPACING_M } from "../src/ElectricFieldMapperConstants.js";
import { CHARGE_PRESETS } from "../src/explore/model/ChargePresets.js";
import { ExploreModel, FIELD_BOUNDS } from "../src/explore/model/ExploreModel.js";
import { automaticFieldLines, electricField, electricPotential } from "../src/explore/model/FieldPhysics.js";

describe("charge configurations", () => {
  it("replaces charges and clears lines tied to the old arrangement", () => {
    const model = new ExploreModel();
    model.addSeed({ x: 0, y: 0.5 });
    model.addEquipotentialAtVoltmeter();
    expect(model.equipotentialSeeds).toHaveLength(1);
    model.presetProperty.value = "quadrupole";

    expect(model.getSnapshot()).toEqual(CHARGE_PRESETS.quadrupole);
    expect(model.seedPoints).toHaveLength(0);
    expect(model.equipotentialSeeds).toHaveLength(0);
    expect(model.presetProperty.value).toBe("quadrupole");

    const first = model.charges[0];
    expect(first).toBeDefined();
    if (!first) {
      throw new Error("Quadrupole should contain a charge");
    }
    first.positionProperty.value = model.snapPosition({ x: -1, y: -1 });
    expect(model.presetProperty.value).toBe("custom");
    model.reset();
    expect(model.presetProperty.value).toBe("dipole");
    expect(model.getSnapshot()).toEqual(CHARGE_PRESETS.dipole);
  });

  it("snaps existing, newly added, and moved charges to the displayed grid", () => {
    const model = new ExploreModel();
    const charge = model.addCharge(1, { x: 0.74, y: -0.26 });
    model.snapToGridProperty.value = true;
    expect(charge.positionProperty.value.x).toBe(0.5);
    expect(charge.positionProperty.value.y).toBe(-0.5);

    const next = model.addCharge(-1, { x: 0.9, y: 0.8 });
    expect(next.positionProperty.value.x).toBe(1);
    expect(next.positionProperty.value.y).toBe(1);
    expect(model.snapPosition({ x: 3.9, y: 2.9 }).x).toBe(FIELD_BOUNDS.maxX - GRID_SPACING_M);
  });

  it("traces finite field lines for every symmetric example", () => {
    for (const charges of Object.values(CHARGE_PRESETS)) {
      const lines = automaticFieldLines(charges, FIELD_BOUNDS, 6);
      expect(lines.length).toBeGreaterThan(0);
      expect(lines.every((line) => line.length > 1 && line.every((point) => Number.isFinite(point.x + point.y)))).toBe(
        true,
      );
      expect(Number.isFinite(electricPotential(charges, { x: 0.25, y: 0.25 }))).toBe(true);
      const field = electricField(charges, { x: 0.25, y: 0.25 });
      expect(Number.isFinite(field.x + field.y)).toBe(true);
    }
  });
});
