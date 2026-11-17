import { ChargeRepresentationNode } from "../src/common/ChargeRepresentationNode.js";
import ElectricFieldMapperColors from "../src/ElectricFieldMapperColors.js";
import { ElectricFieldSensor, PointCharge } from "../src/explore/model/ExploreModel.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

// ProfileColorProperties outlive every charge glyph; keepAlive proves dispose unlinks them.
const chargeColors = [
  ElectricFieldMapperColors.positiveChargeHighlightColorProperty,
  ElectricFieldMapperColors.positiveChargeColorProperty,
  ElectricFieldMapperColors.positiveChargeEdgeColorProperty,
  ElectricFieldMapperColors.chargeSignColorProperty,
] as const;

describeDisposalLeaks([
  { name: "PointCharge", create: () => new PointCharge(1, { x: 0, y: 0 }) },
  { name: "ElectricFieldSensor", create: () => new ElectricFieldSensor({ x: 0, y: 0 }) },
  {
    name: "ChargeRepresentationNode",
    create: () => new ChargeRepresentationNode(1),
    keepAlive: () => chargeColors,
  },
]);
