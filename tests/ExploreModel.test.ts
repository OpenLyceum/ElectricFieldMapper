import { Vector2 } from "scenerystack/dot";
import { describe, expect, it } from "vitest";
import { ExploreModel } from "../src/explore/model/ExploreModel.js";

describe("ExploreModel tools", () => {
  it("adds and removes any number of electric field sensors", () => {
    const model = new ExploreModel();
    const a = model.addSensor({ x: 0, y: 1 });
    model.addSensor({ x: 1, y: 1 });
    expect(model.sensors.length).toBe(2);
    model.removeSensor(a);
    expect(model.sensors.length).toBe(1);
  });

  it("plots equipotentials only from outside a charge disk", () => {
    const model = new ExploreModel();
    model.voltmeterPositionProperty.value =
      model.charges[0]?.positionProperty.value.copy() ?? model.voltmeterPositionProperty.value;
    model.addEquipotentialAtVoltmeter();
    expect(model.equipotentialSeeds).toHaveLength(0);
    model.voltmeterPositionProperty.reset();
    model.addEquipotentialAtVoltmeter();
    expect(model.equipotentialSeeds).toHaveLength(1);
    model.clearEquipotentials();
    expect(model.equipotentialSeeds).toHaveLength(0);
  });

  it("reset puts sensors and the voltmeter away and hides the voltage map", () => {
    const model = new ExploreModel();
    model.addSensor({ x: 0, y: 1 });
    model.voltmeterActiveProperty.value = true;
    model.measuringTapeActiveProperty.value = true;
    model.measuringTapeBasePositionProperty.value = new Vector2(1, 1);
    model.showVoltageProperty.value = true;
    model.showValuesProperty.value = true;
    model.addEquipotentialAtVoltmeter();
    model.reset();
    expect(model.sensors.length).toBe(0);
    expect(model.voltmeterActiveProperty.value).toBe(false);
    expect(model.measuringTapeActiveProperty.value).toBe(false);
    expect(model.measuringTapeBasePositionProperty.value.x).toBe(0);
    expect(model.measuringTapeBasePositionProperty.value.y).toBeCloseTo(1.2);
    expect(model.showVoltageProperty.value).toBe(false);
    expect(model.showValuesProperty.value).toBe(false);
    expect(model.equipotentialSeeds).toHaveLength(0);
    expect(model.charges.length).toBe(2);
  });

  it("cancels charges snapped to the same grid point and restores their fields when separated", () => {
    const model = new ExploreModel();
    for (const charge of [...model.charges]) {
      model.removeCharge(charge);
    }
    const positive = model.addCharge(1, { x: 0.48, y: -0.48 });
    const negative = model.addCharge(-1, { x: 0.52, y: -0.52 });
    expect(model.getSnapshot()).toHaveLength(2);
    model.snapToGridProperty.value = true;
    expect(positive.positionProperty.value.equals(negative.positionProperty.value)).toBe(true);
    expect(model.charges).toHaveLength(2);
    expect(model.getSnapshot()).toEqual([]);
    expect(model.isNearCharge({ x: 0.5, y: -0.5 })).toBe(false);

    negative.positionProperty.value = new Vector2(1, -0.5);
    expect(model.getSnapshot()).toEqual([
      { x: 0.5, y: -0.5, q: 1 },
      { x: 1, y: -0.5, q: -1 },
    ]);
    expect(model.isNearCharge({ x: 0.5, y: -0.5 })).toBe(true);
  });

  it("snaps the measuring tape to minor grid lines only while the grid is shown", () => {
    const model = new ExploreModel();
    model.measuringTapeBasePositionProperty.value = new Vector2(0.13, 0.17);
    model.measuringTapeTipPositionProperty.value = new Vector2(0.44, 0.17);
    model.showGridProperty.value = false;
    model.snapToGridProperty.value = true;
    expect(model.measuringTapeBasePositionProperty.value.x).toBeCloseTo(0.13);
    model.showGridProperty.value = true;
    model.snapMeasuringTape();
    expect(model.measuringTapeBasePositionProperty.value.x).toBeCloseTo(0.1);
    expect(model.measuringTapeBasePositionProperty.value.y).toBeCloseTo(0.2);
    expect(model.measuringTapeTipPositionProperty.value.x).toBeCloseTo(0.4);
  });
});
