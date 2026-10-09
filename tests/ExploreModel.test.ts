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
    model.showVoltageProperty.value = true;
    model.addEquipotentialAtVoltmeter();
    model.reset();
    expect(model.sensors.length).toBe(0);
    expect(model.voltmeterActiveProperty.value).toBe(false);
    expect(model.showVoltageProperty.value).toBe(false);
    expect(model.equipotentialSeeds).toHaveLength(0);
    expect(model.charges.length).toBe(2);
  });
});
