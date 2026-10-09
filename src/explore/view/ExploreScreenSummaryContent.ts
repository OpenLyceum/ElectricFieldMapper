import { DerivedProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { ExploreModel } from "../model/ExploreModel.js";

export class ExploreScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: ExploreModel) {
    const a11y = StringManager.getInstance().getExploreA11yStrings();
    const details = new DerivedProperty(
      [model.changeCountProperty],
      () => `${model.charges.length} charges. ${model.seedPoints.length} drawn field lines.`,
    );
    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: details,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
