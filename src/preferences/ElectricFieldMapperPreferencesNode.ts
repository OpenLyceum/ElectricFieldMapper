import type { TReadOnlyProperty } from "scenerystack/axon";
import { HBox, type Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { AquaRadioButtonGroup, type AquaRadioButtonGroupOptions, Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import ElectricFieldMapperColors from "../ElectricFieldMapperColors.js";
import ElectricFieldMapperNamespace from "../ElectricFieldMapperNamespace.js";
import { LINES_PER_NANOCOULOMB } from "../explore/model/FieldDisplayOptions.js";
import { StringManager } from "../i18n/StringManager.js";
import type { ElectricFieldMapperPreferencesModel } from "./ElectricFieldMapperPreferencesModel.js";

export class ElectricFieldMapperPreferencesNode extends VBox {
  public constructor(model: ElectricFieldMapperPreferencesModel, tandem?: Tandem) {
    const strings = StringManager.getInstance().getPreferences();
    const textFill = ElectricFieldMapperColors.controlSurfaceTextColorProperty;
    // Each column is about half of the preferences dialog, so labels wrap inside it.
    const columnLabelWidth = 210;
    const choice = (label: TReadOnlyProperty<string> | string) =>
      new Text(label, {
        font: new PhetFont(14),
        fill: textFill,
        maxWidth: columnLabelWidth,
      });
    const heading = (label: TReadOnlyProperty<string>) =>
      new Text(label, {
        font: new PhetFont({ size: 16, weight: "bold" }),
        fill: textFill,
        maxWidth: columnLabelWidth,
      });
    const radioOptions = (
      accessibleName: TReadOnlyProperty<string>,
      tandemName: string,
    ): AquaRadioButtonGroupOptions => ({
      orientation: "vertical",
      align: "left",
      spacing: 5,
      accessibleName,
      ...(tandem && { tandem: tandem.createTandem(tandemName) }),
    });
    const section = (title: Node, control: Node) => new VBox({ align: "left", spacing: 6, children: [title, control] });
    const column = (...children: Node[]) =>
      new VBox({
        align: "left",
        spacing: 14,
        minContentWidth: 230,
        children,
      });
    const checkboxOptions = {
      checkboxColor: textFill,
      checkboxColorBackground: ElectricFieldMapperColors.controlSurfaceColorProperty,
      spacing: 8,
    };
    const voltageScale = section(
      heading(strings.voltageScaleStringProperty),
      new AquaRadioButtonGroup(
        model.voltageScaleProperty,
        [
          { value: "10", createNode: () => choice(strings.voltageScale10StringProperty), tandemName: "scale10" },
          { value: "40", createNode: () => choice(strings.voltageScale40StringProperty), tandemName: "scale40" },
          { value: "200", createNode: () => choice(strings.voltageScale200StringProperty), tandemName: "scale200" },
          { value: "auto", createNode: () => choice(strings.voltageScaleAutoStringProperty), tandemName: "scaleAuto" },
        ],
        radioOptions(strings.voltageScaleStringProperty, "voltageScaleRadioButtonGroup"),
      ),
    );
    const arrowScale = section(
      heading(strings.arrowScaleStringProperty),
      new AquaRadioButtonGroup(
        model.arrowScaleProperty,
        [
          {
            value: "direction",
            createNode: () => choice(strings.arrowScaleDirectionStringProperty),
            tandemName: "direction",
          },
          {
            value: "compressed",
            createNode: () => choice(strings.arrowScaleCompressedStringProperty),
            tandemName: "compressed",
          },
          {
            value: "linear",
            createNode: () => choice(strings.arrowScaleLinearStringProperty),
            tandemName: "linear",
          },
        ],
        radioOptions(strings.arrowScaleStringProperty, "arrowScaleRadioButtonGroup"),
      ),
    );
    const linesPerNanocoulomb = section(
      heading(strings.linesPerNanocoulombStringProperty),
      new AquaRadioButtonGroup(
        model.linesPerNanocoulombProperty,
        LINES_PER_NANOCOULOMB.map((value) => ({
          value,
          createNode: () => choice(String(value)),
          tandemName: `lines${value}`,
        })),
        radioOptions(strings.linesPerNanocoulombStringProperty, "linesPerNanocoulombRadioButtonGroup"),
      ),
    );
    const fieldLineArrowheads = new Checkbox(
      model.fieldLineArrowheadsProperty,
      choice(strings.fieldLineArrowheadsStringProperty),
      {
        ...checkboxOptions,
        ...(tandem && { tandem: tandem.createTandem("fieldLineArrowheadsCheckbox") }),
      },
    );
    const fieldZeros = new Checkbox(model.showFieldZerosProperty, choice(strings.showFieldZerosStringProperty), {
      ...checkboxOptions,
      ...(tandem && { tandem: tandem.createTandem("showFieldZerosCheckbox") }),
    });

    super({
      align: "left",
      spacing: 14,
      children: [
        new Text(strings.titleStringProperty, {
          font: new PhetFont({ size: 18, weight: "bold" }),
          fill: textFill,
        }),
        new HBox({
          align: "top",
          spacing: 24,
          children: [column(voltageScale, arrowScale), column(fieldLineArrowheads, linesPerNanocoulomb, fieldZeros)],
        }),
      ],
    });
  }
}

ElectricFieldMapperNamespace.register("ElectricFieldMapperPreferencesNode", ElectricFieldMapperPreferencesNode);
