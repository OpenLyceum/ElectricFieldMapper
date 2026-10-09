import { BooleanProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
import ElectricFieldMapperNamespace from "../ElectricFieldMapperNamespace.js";
import electricFieldMapperQueryParameters from "./electricFieldMapperQueryParameters.js";

export class ElectricFieldMapperPreferencesModel {
  public readonly denseFieldLinesProperty: BooleanProperty;
  public constructor(tandem?: Tandem) {
    this.denseFieldLinesProperty = new BooleanProperty(
      electricFieldMapperQueryParameters.denseFieldLines,
      tandem ? { tandem: tandem.createTandem("denseFieldLinesProperty") } : undefined,
    );
  }
  public reset(): void {
    this.denseFieldLinesProperty.reset();
  }
}

ElectricFieldMapperNamespace.register("ElectricFieldMapperPreferencesModel", ElectricFieldMapperPreferencesModel);
