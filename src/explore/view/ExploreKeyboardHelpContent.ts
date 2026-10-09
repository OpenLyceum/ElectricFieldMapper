/**
 * ExploreKeyboardHelpContent.ts
 *
 * Content for the keyboard-help dialog (the "?" button in the navigation bar).
 * The template's only interactions are buttons and Reset All, so a single
 * basic-actions section covers the available keyboard controls. When the sim
 * grows, fill the right column (pattern stubbed below).
 */

import {
  BasicActionsKeyboardHelpSection,
  ComboBoxKeyboardHelpSection,
  // SliderControlsKeyboardHelpSection,
  // TimeControlsKeyboardHelpSection,
  TwoColumnKeyboardHelpContent,
} from "scenerystack/scenery-phet";

export class ExploreKeyboardHelpContent extends TwoColumnKeyboardHelpContent {
  public constructor() {
    const leftColumn = [new ComboBoxKeyboardHelpSection()];

    // Right column — uncomment when the sim adds sliders and/or TimeControlNode:
    // const rightColumn = [
    //   new SliderControlsKeyboardHelpSection(),
    //   // new TimeControlsKeyboardHelpSection(),
    // ];
    const rightColumn = [new BasicActionsKeyboardHelpSection({ withCheckboxContent: true })];

    super(leftColumn, rightColumn);
  }
}
