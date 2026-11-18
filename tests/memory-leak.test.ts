import { Vector2 } from "scenerystack/dot";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import { describe, it } from "vitest";
import { ChargeRepresentationNode } from "../src/common/ChargeRepresentationNode.js";
import ElectricFieldMapperColors from "../src/ElectricFieldMapperColors.js";
import { ElectricFieldSensor, ExploreModel, PointCharge } from "../src/explore/model/ExploreModel.js";
import { ChargeNode } from "../src/explore/view/ChargeNode.js";
import { ElectricFieldSensorNode } from "../src/explore/view/ElectricFieldSensorNode.js";
import { FieldCanvasNode } from "../src/explore/view/FieldCanvasNode.js";
import { StringManager } from "../src/i18n/StringManager.js";
import { describeDisposalLeaks, expectNoListenerGrowth } from "./helpers/memoryLeak.js";

// ProfileColorProperties outlive every charge glyph; keepAlive proves dispose unlinks them.
const chargeColors = [
  ElectricFieldMapperColors.positiveChargeHighlightColorProperty,
  ElectricFieldMapperColors.positiveChargeColorProperty,
  ElectricFieldMapperColors.positiveChargeEdgeColorProperty,
  ElectricFieldMapperColors.chargeSignColorProperty,
] as const;

// ChargeNode and ElectricFieldSensorNode are created and removed with the model's charges and
// sensors. The model, the items and their position Properties outlive each view here, so a node
// whose dispose forgets an unlink, drag listener or hotkey stays reachable from them.
const model = new ExploreModel();
const mvt = ModelViewTransform2.createSinglePointScaleMapping(Vector2.ZERO, new Vector2(400, 300), 40);
const positiveCharge = model.addCharge(1, { x: -1, y: 0 });
const negativeCharge = model.addCharge(-1, { x: 1, y: 0 });
const sensor = model.addSensor({ x: 0, y: 2 });
const a11y = StringManager.getInstance().getExploreA11yStrings();
const noop = (): void => {
  /* drops are not exercised */
};

const chargeNodeDependencies = (charge: PointCharge): readonly object[] => [
  model,
  charge,
  charge.positionProperty,
  model.snapToGridProperty,
  a11y.controls.positiveChargeStringProperty,
  a11y.controls.negativeChargeStringProperty,
  a11y.controls.moveChargeStringProperty,
];
const sensorNodeDependencies = (): readonly object[] => [
  model,
  sensor,
  sensor.positionProperty,
  model.changeCountProperty,
  model.showValuesProperty,
  a11y.controls.fieldSensorStringProperty,
  a11y.controls.moveFieldSensorStringProperty,
];

// FieldCanvasNode links its repaint to these by hand (the colors are read in paintCanvas, not
// passed as fill), so it must unlink every one even without a Display.
const fieldCanvasDependencies = (): readonly object[] => [
  model.fieldBoundsProperty,
  model.changeCountProperty,
  model.showVectorsProperty,
  model.showLinesProperty,
  model.showGridProperty,
  model.automaticLinesProperty,
  model.linesPerNanocoulombProperty,
  model.voltageScaleProperty,
  model.arrowScaleProperty,
  model.fieldLineArrowheadsProperty,
  model.showFieldZerosProperty,
  model.showVoltageProperty,
  model.showValuesProperty,
  ElectricFieldMapperColors.gridColorProperty,
  ElectricFieldMapperColors.fieldArrowColorProperty,
  ElectricFieldMapperColors.fieldLineColorProperty,
  ElectricFieldMapperColors.playAreaColorProperty,
  ElectricFieldMapperColors.potentialPositiveColorProperty,
  ElectricFieldMapperColors.potentialNegativeColorProperty,
  ElectricFieldMapperColors.equipotentialLineColorProperty,
  ElectricFieldMapperColors.equipotentialLabelBackgroundColorProperty,
  ElectricFieldMapperColors.equipotentialLabelTextColorProperty,
  ElectricFieldMapperColors.fieldZeroColorProperty,
  ElectricFieldMapperColors.fieldZeroHaloColorProperty,
];

describeDisposalLeaks([
  { name: "PointCharge", create: () => new PointCharge(1, { x: 0, y: 0 }) },
  { name: "ElectricFieldSensor", create: () => new ElectricFieldSensor({ x: 0, y: 0 }) },
  {
    name: "ChargeRepresentationNode",
    create: () => new ChargeRepresentationNode(1),
    keepAlive: () => chargeColors,
  },
  {
    name: "ChargeNode (positive)",
    create: () => new ChargeNode(positiveCharge, model, mvt, noop),
    keepAlive: () => chargeNodeDependencies(positiveCharge),
  },
  {
    name: "ChargeNode (negative)",
    create: () => new ChargeNode(negativeCharge, model, mvt, noop),
    keepAlive: () => chargeNodeDependencies(negativeCharge),
  },
  {
    name: "ElectricFieldSensorNode",
    create: () => new ElectricFieldSensorNode(sensor, model, mvt, noop),
    keepAlive: sensorNodeDependencies,
  },
  {
    name: "FieldCanvasNode",
    create: () => new FieldCanvasNode(model, mvt),
    keepAlive: () => [model, ...fieldCanvasDependencies()],
  },
]);

describe("charge and sensor views leave no listeners on live model state", () => {
  it("ChargeNode create/dispose keeps position, snap and a11y string listener counts flat", async () => {
    await expectNoListenerGrowth(chargeNodeDependencies(positiveCharge).slice(2), () => {
      const node = new ChargeNode(positiveCharge, model, mvt, noop);
      positiveCharge.positionProperty.value = new Vector2(-2, 1);
      model.snapToGridProperty.value = !model.snapToGridProperty.value;
      node.dispose();
    });
  });

  it("ElectricFieldSensorNode create/dispose keeps position, field and a11y string listener counts flat", async () => {
    await expectNoListenerGrowth(sensorNodeDependencies().slice(2), () => {
      const node = new ElectricFieldSensorNode(sensor, model, mvt, noop);
      sensor.positionProperty.value = new Vector2(0.5, 2);
      model.notifyChanged();
      model.showValuesProperty.value = !model.showValuesProperty.value;
      node.dispose();
    });
  });

  it("FieldCanvasNode create/dispose keeps model and manually linked color listener counts flat", async () => {
    await expectNoListenerGrowth(fieldCanvasDependencies(), () => {
      const node = new FieldCanvasNode(model, mvt);
      model.notifyChanged();
      model.showGridProperty.value = !model.showGridProperty.value;
      node.dispose();
    });
  });
});
