import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import ElectricFieldMapperNamespace from "../ElectricFieldMapperNamespace.js";

const electricFieldMapperQueryParameters = QueryStringMachine.getAll({
  denseFieldLines: { type: "boolean", defaultValue: false, public: true },
});

ElectricFieldMapperNamespace.register("electricFieldMapperQueryParameters", electricFieldMapperQueryParameters);
logGlobal("phet.chipper.queryParameters");
export default electricFieldMapperQueryParameters;
