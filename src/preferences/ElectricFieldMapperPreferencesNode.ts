import type { TReadOnlyProperty } from "scenerystack/axon";
import { HBox, type Node, Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { AquaRadioButtonGroup, type AquaRadioButtonGroupOptions, Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import { LINES_PER_NANOCOULOMB } from "../common/model/FieldDisplayOptions.js";
import ElectricFieldMapperColors from "../ElectricFieldMapperColors.js";
import { ELECTRIC_FIELD_MAPPER_PREFERENCES_NODE_SETTINGS } from "../ElectricFieldMapperConstants.js";
import ElectricFieldMapperNamespace from "../ElectricFieldMapperNamespace.js";
import { StringManager } from "../i18n/StringManager.js";
import type { ElectricFieldMapperPreferencesModel } from "./ElectricFieldMapperPreferencesModel.js";

export class ElectricFieldMapperPreferencesNode extends VBox {
  public constructor(model: ElectricFieldMapperPreferencesModel, tandem?: Tandem) {
    const strings = StringManager.getInstance().getPreferences();
    const textFill = ElectricFieldMapperColors.controlSurfaceTextColorProperty;
    // Each column is about half of the preferences dialog, so labels wrap inside it.
    const columnLabelWidth: number = ELECTRIC_FIELD_MAPPER_PREFERENCES_NODE_SETTINGS.COLUMN_LABEL_WIDTH;
    const choice = (label: TReadOnlyProperty<string> | string) =>
      new Text(label, {
        font: new PhetFont(ELECTRIC_FIELD_MAPPER_PREFERENCES_NODE_SETTINGS.CHOICE_FONT_SIZE),
        fill: textFill,
        maxWidth: columnLabelWidth,
      });
    const heading = (label: TReadOnlyProperty<string>) =>
      new Text(label, {
        font: new PhetFont({ size: ELECTRIC_FIELD_MAPPER_PREFERENCES_NODE_SETTINGS.HEADING_FONT_SIZE, weight: "bold" }),
        fill: textFill,
        maxWidth: columnLabelWidth,
      });
    const radioOptions = (
      accessibleName: TReadOnlyProperty<string>,
      tandemName: string,
    ): AquaRadioButtonGroupOptions => ({
      orientation: "vertical",
      align: "left",
      spacing: ELECTRIC_FIELD_MAPPER_PREFERENCES_NODE_SETTINGS.RADIO_OPTIONS_SPACING,
      accessibleName,
      ...(tandem && { tandem: tandem.createTandem(tandemName) }),
    });
    const section = (title: Node, control: Node) =>
      new VBox({
        align: "left",
        spacing: ELECTRIC_FIELD_MAPPER_PREFERENCES_NODE_SETTINGS.SECTION_SPACING,
        children: [title, control],
      });
    const column = (...children: Node[]) =>
      new VBox({
        align: "left",
        spacing: ELECTRIC_FIELD_MAPPER_PREFERENCES_NODE_SETTINGS.COLUMN_SPACING,
        minContentWidth: 230,
        children,
      });
    const checkboxOptions = {
      checkboxColor: textFill,
      checkboxColorBackground: ElectricFieldMapperColors.controlSurfaceColorProperty,
      spacing: ELECTRIC_FIELD_MAPPER_PREFERENCES_NODE_SETTINGS.CHECKBOX_OPTIONS_SPACING,
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
      spacing: ELECTRIC_FIELD_MAPPER_PREFERENCES_NODE_SETTINGS.CONSTRUCTOR_SPACING,
      children: [
        new Text(strings.titleStringProperty, {
          font: new PhetFont({
            size: ELECTRIC_FIELD_MAPPER_PREFERENCES_NODE_SETTINGS.CONSTRUCTOR_FONT_SIZE,
            weight: "bold",
          }),
          fill: textFill,
        }),
        new HBox({
          align: "top",
          spacing: ELECTRIC_FIELD_MAPPER_PREFERENCES_NODE_SETTINGS.ITEM_2_SPACING,
          children: [column(voltageScale, arrowScale), column(fieldLineArrowheads, linesPerNanocoulomb, fieldZeros)],
        }),
      ],
    });
  }
}

ElectricFieldMapperNamespace.register("ElectricFieldMapperPreferencesNode", ElectricFieldMapperPreferencesNode);
