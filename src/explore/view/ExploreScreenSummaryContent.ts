import { DerivedProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { ExploreModel } from "../model/ExploreModel.js";

export class ExploreScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: ExploreModel) {
    const a11y = StringManager.getInstance().getExploreA11yStrings();
    const details = new DerivedProperty(
      [
        model.changeCountProperty,
        model.sensors.lengthProperty,
        model.voltmeterActiveProperty,
        model.measuringTapeActiveProperty,
        model.showVoltageProperty,
        model.showValuesProperty,
      ],
      () =>
        `${model.charges.length} charges. ${model.sensors.length} electric field sensors. ` +
        `Voltmeter ${model.voltmeterActiveProperty.value ? "on the board" : "in the toolbox"}. ` +
        `Measuring tape ${model.measuringTapeActiveProperty.value ? "on the board" : "in the toolbox"}. ` +
        `Voltage map ${model.showVoltageProperty.value ? "shown" : "hidden"}. ` +
        `Numeric values ${model.showValuesProperty.value ? "shown" : "hidden"}. ` +
        `${model.seedPoints.length} drawn field lines. ${model.equipotentialSeeds.length} equipotential lines.`,
    );
    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: details,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
