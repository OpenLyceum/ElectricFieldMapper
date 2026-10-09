/**
 * FieldLinesInfoDialog.ts
 *
 * Explains why field lines can meet at one point on this two-dimensional board.
 */

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
    const body = new RichText(ui.infoBodyStringProperty, {
      font: new PhetFont(16),
      fill: ElectricFieldMapperColors.textColorProperty,
      lineWrap: INFO_DIALOG_LINE_WRAP,
      accessibleParagraph: ui.infoBodyStringProperty,
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
