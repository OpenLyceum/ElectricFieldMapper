import { HotkeyData } from "scenerystack/scenery";
import { StringManager } from "../i18n/StringManager.js";

const help = StringManager.getInstance().getExploreA11yStrings().keyboardHelp;

/** Shared by each removable object's listener and the keyboard-help dialog. */
export const REMOVE_ITEM_HOTKEY_DATA = new HotkeyData({
  keys: ["delete", "backspace"],
  repoName: "electric-field-mapper",
  keyboardHelpDialogLabelStringProperty: help.removeStringProperty,
  keyboardHelpDialogPDOMLabelStringProperty: help.removeDescriptionStringProperty,
});
