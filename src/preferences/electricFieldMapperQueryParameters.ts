import { logGlobal } from "scenerystack/phet-core";
import { QueryStringMachine } from "scenerystack/query-string-machine";
import ElectricFieldMapperNamespace from "../ElectricFieldMapperNamespace.js";
import { CHARGE_PRESET_VALUES } from "../explore/model/ChargePresets.js";

/**
 * Public launch options. Booleans are `true` or `false`. An unrecognized value falls back to the default.
 *
 * Checkboxes: `showVectors`, `showLines`, `automaticLines`, `showVoltage`, `showValues`, `showGrid`,
 * `snapToGrid`, `drawMode`, and the Preferences checkbox `denseFieldLines`.
 * Combo box: `preset` is `custom`, `dipole`, `likePair`, `line`, `alternatingLine`, `square`,
 * `quadrupole`, or `parallelPlates`.
 */
const electricFieldMapperQueryParameters = QueryStringMachine.getAll({
  denseFieldLines: { type: "boolean", defaultValue: false, public: true },
  showVectors: { type: "boolean", defaultValue: true, public: true },
  showLines: { type: "boolean", defaultValue: true, public: true },
  automaticLines: { type: "boolean", defaultValue: true, public: true },
  showVoltage: { type: "boolean", defaultValue: false, public: true },
  showValues: { type: "boolean", defaultValue: false, public: true },
  showGrid: { type: "boolean", defaultValue: true, public: true },
  snapToGrid: { type: "boolean", defaultValue: false, public: true },
  drawMode: { type: "boolean", defaultValue: false, public: true },
  preset: {
    type: "string",
    defaultValue: "dipole",
    validValues: CHARGE_PRESET_VALUES,
    public: true,
  },
});

ElectricFieldMapperNamespace.register("electricFieldMapperQueryParameters", electricFieldMapperQueryParameters);
logGlobal("phet.chipper.queryParameters");
export default electricFieldMapperQueryParameters;
