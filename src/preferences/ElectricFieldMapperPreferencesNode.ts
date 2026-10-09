import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import ElectricFieldMapperColors from "../ElectricFieldMapperColors.js";
import ElectricFieldMapperNamespace from "../ElectricFieldMapperNamespace.js";
import { StringManager } from "../i18n/StringManager.js";
import type { ElectricFieldMapperPreferencesModel } from "./ElectricFieldMapperPreferencesModel.js";

export class ElectricFieldMapperPreferencesNode extends VBox {
  public constructor(model: ElectricFieldMapperPreferencesModel, tandem?: Tandem) {
    const strings = StringManager.getInstance().getPreferences();
    super({
      align: "left",
      spacing: 12,
      children: [
        new Text(strings.titleStringProperty, {
          font: new PhetFont({ size: 18, weight: "bold" }),
          fill: ElectricFieldMapperColors.controlSurfaceTextColorProperty,
        }),
        new Checkbox(
          model.denseFieldLinesProperty,
          new Text(strings.denseFieldLinesStringProperty, {
            font: new PhetFont(14),
            fill: ElectricFieldMapperColors.controlSurfaceTextColorProperty,
          }),
          {
            checkboxColor: ElectricFieldMapperColors.controlSurfaceTextColorProperty,
            checkboxColorBackground: ElectricFieldMapperColors.controlSurfaceColorProperty,
            spacing: 8,
            ...(tandem && { tandem: tandem.createTandem("denseFieldLinesCheckbox") }),
          },
        ),
      ],
    });
  }
}

ElectricFieldMapperNamespace.register("ElectricFieldMapperPreferencesNode", ElectricFieldMapperPreferencesNode);
