/**
 * FieldLinesInfoDialog.ts
 *
 * Explains why some field lines end at a zero-field point instead of a negative charge or infinity.
 */

import { DerivedProperty } from "scenerystack/axon";
import { RichText, Text } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Dialog } from "scenerystack/sim";
import ElectricFieldMapperColors from "../../ElectricFieldMapperColors.js";
import { INFO_DIALOG_LINE_WRAP } from "../../ElectricFieldMapperConstants.js";
import { StringManager } from "../../i18n/StringManager.js";

export class FieldLinesInfoDialog extends Dialog {
  public constructor() {
    const ui = StringManager.getInstance().getUiStrings();
    const title = new Text(ui.infoTitleStringProperty, {
      font: new PhetFont({ size: 20, weight: "bold" }),
      fill: ElectricFieldMapperColors.textColorProperty,
      maxWidth: INFO_DIALOG_LINE_WRAP,
    });
    const spokenBody = new DerivedProperty([ui.infoBodyStringProperty], (markup) => markup.replace(/<\/?b>/g, ""));
    const body = new RichText(ui.infoBodyStringProperty, {
      font: new PhetFont(16),
      fill: ElectricFieldMapperColors.textColorProperty,
      lineWrap: INFO_DIALOG_LINE_WRAP,
      accessibleParagraph: spokenBody,
    });
    super(body, {
      title,
      titleAlign: "center",
      fill: ElectricFieldMapperColors.panelBackgroundColorProperty,
      stroke: ElectricFieldMapperColors.panelBorderColorProperty,
      closeButtonColor: ElectricFieldMapperColors.textColorProperty,
      accessibleName: ui.infoTitleStringProperty,
    });
  }
}
