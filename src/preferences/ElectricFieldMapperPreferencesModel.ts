import { BooleanProperty, NumberProperty, StringProperty } from "scenerystack/axon";
import type { Tandem } from "scenerystack/tandem";
import ElectricFieldMapperNamespace from "../ElectricFieldMapperNamespace.js";
import {
  ARROW_SCALES,
  asArrowScale,
  asVoltageScale,
  type FieldDisplayPreferences,
  LINES_PER_NANOCOULOMB,
  VOLTAGE_SCALES,
} from "../explore/model/FieldDisplayOptions.js";
import electricFieldMapperQueryParameters from "./electricFieldMapperQueryParameters.js";

export class ElectricFieldMapperPreferencesModel {
  public readonly linesPerNanocoulombProperty: NumberProperty;
  public readonly voltageScaleProperty: StringProperty;
  public readonly arrowScaleProperty: StringProperty;
  public readonly fieldLineArrowheadsProperty: BooleanProperty;
  public readonly showFieldZerosProperty: BooleanProperty;
  public readonly fieldDisplay: FieldDisplayPreferences;

  public constructor(tandem?: Tandem) {
    const tandemOptions = (name: string) => (tandem ? { tandem: tandem.createTandem(name) } : undefined);
    this.linesPerNanocoulombProperty = new NumberProperty(electricFieldMapperQueryParameters.linesPerNanocoulomb, {
      numberType: "Integer",
      validValues: [...LINES_PER_NANOCOULOMB],
      ...tandemOptions("linesPerNanocoulombProperty"),
    });
    this.voltageScaleProperty = new StringProperty(
      asVoltageScale(electricFieldMapperQueryParameters.voltageScale ?? "40"),
      {
        validValues: [...VOLTAGE_SCALES],
        ...tandemOptions("voltageScaleProperty"),
      },
    );
    this.arrowScaleProperty = new StringProperty(
      asArrowScale(electricFieldMapperQueryParameters.arrowScale ?? "compressed"),
      {
        validValues: [...ARROW_SCALES],
        ...tandemOptions("arrowScaleProperty"),
      },
    );
    this.fieldLineArrowheadsProperty = new BooleanProperty(
      electricFieldMapperQueryParameters.fieldLineArrowheads,
      tandemOptions("fieldLineArrowheadsProperty"),
    );
    this.showFieldZerosProperty = new BooleanProperty(
      electricFieldMapperQueryParameters.showFieldZeros,
      tandemOptions("showFieldZerosProperty"),
    );
    this.fieldDisplay = {
      linesPerNanocoulombProperty: this.linesPerNanocoulombProperty,
      voltageScaleProperty: this.voltageScaleProperty,
      arrowScaleProperty: this.arrowScaleProperty,
      fieldLineArrowheadsProperty: this.fieldLineArrowheadsProperty,
      showFieldZerosProperty: this.showFieldZerosProperty,
    };
  }

  public reset(): void {
    this.linesPerNanocoulombProperty.reset();
    this.voltageScaleProperty.reset();
    this.arrowScaleProperty.reset();
    this.fieldLineArrowheadsProperty.reset();
    this.showFieldZerosProperty.reset();
  }
}

ElectricFieldMapperNamespace.register("ElectricFieldMapperPreferencesModel", ElectricFieldMapperPreferencesModel);
