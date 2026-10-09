import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  KeyboardHelpIconFactory,
  KeyboardHelpSection,
  KeyboardHelpSectionRow,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";
import { REMOVE_ITEM_HOTKEY_DATA } from "../../common/ElectricFieldMapperHotkeyData.js";
import { StringManager } from "../../i18n/StringManager.js";

export class ExploreKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const help = StringManager.getInstance().getExploreA11yStrings().keyboardHelp;
    // RichDragListener owns the arrow/WASD bindings. Use the framework's standard drag icons.
    const moveItems = new KeyboardHelpSection(help.headingStringProperty, [
      KeyboardHelpSectionRow.labelWithIcon(help.moveStringProperty, KeyboardHelpIconFactory.arrowOrWasdKeysRowIcon(), {
        labelInnerContent: help.moveDescriptionStringProperty,
      }),
      KeyboardHelpSectionRow.labelWithIconList(
        help.slowerStringProperty,
        [
          KeyboardHelpIconFactory.shiftPlusIcon(KeyboardHelpIconFactory.arrowKeysRowIcon()),
          KeyboardHelpIconFactory.shiftPlusIcon(KeyboardHelpIconFactory.wasdRowIcon()),
        ],
        { labelInnerContent: help.slowerDescriptionStringProperty },
      ),
      KeyboardHelpSectionRow.fromHotkeyData(REMOVE_ITEM_HOTKEY_DATA),
    ]);
    super(
      [moveItems, new ComboBoxKeyboardHelpSection()],
      [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })],
    );
  }
}
