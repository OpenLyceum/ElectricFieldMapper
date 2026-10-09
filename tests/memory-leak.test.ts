import { ElectricFieldSensor, PointCharge } from "../src/explore/model/ExploreModel.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  { name: "PointCharge", create: () => new PointCharge(1, { x: 0, y: 0 }) },
  { name: "ElectricFieldSensor", create: () => new ElectricFieldSensor({ x: 0, y: 0 }) },
]);
