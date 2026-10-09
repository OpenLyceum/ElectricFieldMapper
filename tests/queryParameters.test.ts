import { QueryStringMachine } from "scenerystack/query-string-machine";
import { describe, expect, it } from "vitest";
import { CHARGE_PRESETS } from "../src/explore/model/ChargePresets.js";
import { ExploreModel } from "../src/explore/model/ExploreModel.js";
import electricFieldMapperQueryParameters from "../src/preferences/electricFieldMapperQueryParameters.js";

describe("launch query parameters", () => {
  const schema = electricFieldMapperQueryParameters.SCHEMA_MAP;

  it("reads checkbox and configuration values from a query string", () => {
    const parsed = QueryStringMachine.getAllForString(
      schema,
      "?preset=quadrupole&showVoltage=true&showVectors=false&snapToGrid=true&drawMode=true&automaticLines=false&showValues=true&showGrid=false&showLines=false&voltageScale=auto&arrowScale=linear&fieldLineArrowheads=false&linesPerNanocoulomb=24&showFieldZeros=true",
    );
    expect(parsed.preset).toBe("quadrupole");
    expect(parsed.showVoltage).toBe(true);
    expect(parsed.showVectors).toBe(false);
    expect(parsed.snapToGrid).toBe(true);
    expect(parsed.drawMode).toBe(true);
    expect(parsed.automaticLines).toBe(false);
    expect(parsed.showValues).toBe(true);
    expect(parsed.showGrid).toBe(false);
    expect(parsed.showLines).toBe(false);
    expect(parsed.voltageScale).toBe("auto");
    expect(parsed.arrowScale).toBe("linear");
    expect(parsed.fieldLineArrowheads).toBe(false);
    expect(parsed.linesPerNanocoulomb).toBe(24);
    expect(parsed.showFieldZeros).toBe(true);
  });

  it("keeps the built-in defaults when a value is missing or unrecognized", () => {
    const parsed = QueryStringMachine.getAllForString(
      schema,
      "?preset=not-a-preset&showVoltage=maybe&voltageScale=nope&arrowScale=quadratic&linesPerNanocoulomb=20",
    );
    expect(parsed.preset).toBe("dipole");
    expect(parsed.showVoltage).toBe(false);
    expect(parsed.showVectors).toBe(true);
    expect(parsed.showLines).toBe(true);
    expect(parsed.automaticLines).toBe(true);
    expect(parsed.showGrid).toBe(true);
    expect(parsed.snapToGrid).toBe(false);
    expect(parsed.drawMode).toBe(false);
    expect(parsed.voltageScale).toBe("40");
    expect(parsed.arrowScale).toBe("compressed");
    expect(parsed.fieldLineArrowheads).toBe(true);
    expect(parsed.linesPerNanocoulomb).toBe(12);
    expect(parsed.showFieldZeros).toBe(false);
  });

  it("opens on the requested configuration and restores it on reset", () => {
    const model = new ExploreModel(undefined, {
      showVectors: false,
      showVoltage: true,
      showValues: true,
      snapToGrid: true,
      drawMode: true,
      preset: "square",
    });
    expect(model.presetProperty.value).toBe("square");
    expect(model.getSnapshot()).toEqual([...CHARGE_PRESETS.square]);
    expect(model.showVectorsProperty.value).toBe(false);
    expect(model.showVoltageProperty.value).toBe(true);
    expect(model.showValuesProperty.value).toBe(true);
    expect(model.snapToGridProperty.value).toBe(true);
    expect(model.drawModeProperty.value).toBe(true);

    model.presetProperty.value = "dipole";
    model.showVoltageProperty.value = false;
    model.reset();
    expect(model.presetProperty.value).toBe("square");
    expect(model.getSnapshot()).toEqual([...CHARGE_PRESETS.square]);
    expect(model.showVoltageProperty.value).toBe(true);
    expect(model.showVectorsProperty.value).toBe(false);
  });

  it("opens an empty custom arrangement and clears edits on reset", () => {
    const model = new ExploreModel(undefined, { preset: "custom" });
    expect(model.charges).toHaveLength(0);
    expect(model.presetProperty.value).toBe("custom");
    model.addCharge(1, { x: 0, y: 0 });
    model.reset();
    expect(model.charges).toHaveLength(0);
    expect(model.presetProperty.value).toBe("custom");
  });
});
