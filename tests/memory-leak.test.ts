import { PointCharge } from "../src/explore/model/ExploreModel.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([{ name: "PointCharge", create: () => new PointCharge(1, { x: 0, y: 0 }) }]);
