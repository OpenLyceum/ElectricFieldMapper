import { DerivedProperty, PatternStringProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import type { ExploreModel } from "../model/ExploreModel.js";

export class ExploreScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: ExploreModel) {
    const a11y = StringManager.getInstance().getExploreA11yStrings();
    const states = a11y.detailStates;
    const describeState = (
      activeProperty: TReadOnlyProperty<boolean>,
      activeStringProperty: TReadOnlyProperty<string>,
      inactiveStringProperty: TReadOnlyProperty<string>,
    ) =>
      new DerivedProperty(
        [activeProperty, activeStringProperty, inactiveStringProperty],
        (active, activeText, inactiveText) => (active ? activeText : inactiveText),
      );
    const voltmeterState = describeState(
      model.voltmeterActiveProperty,
      states.voltmeterOnBoardStringProperty,
      states.voltmeterInToolboxStringProperty,
    );
    const measuringTapeState = describeState(
      model.measuringTapeActiveProperty,
      states.measuringTapeOnBoardStringProperty,
      states.measuringTapeInToolboxStringProperty,
    );
    const voltageMapState = describeState(
      model.showVoltageProperty,
      states.voltageMapShownStringProperty,
      states.voltageMapHiddenStringProperty,
    );
    const valuesState = describeState(
      model.showValuesProperty,
      states.valuesShownStringProperty,
      states.valuesHiddenStringProperty,
    );
    const fieldLineCount = new DerivedProperty([model.changeCountProperty], () => model.seedPoints.length);
    const equipotentialCount = new DerivedProperty([model.changeCountProperty], () => model.equipotentialSeeds.length);
    const details = new PatternStringProperty(a11y.currentDetailsStringProperty, {
      chargeCount: model.charges.lengthProperty,
      sensorCount: model.sensors.lengthProperty,
      voltmeterState,
      measuringTapeState,
      voltageMapState,
      valuesState,
      fieldLineCount,
      equipotentialCount,
    });
    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: details,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
    this.disposeEmitter.addListener(() => {
      details.dispose();
      for (const property of [
        voltmeterState,
        measuringTapeState,
        voltageMapState,
        valuesState,
        fieldLineCount,
        equipotentialCount,
      ]) {
        property.dispose();
      }
    });
  }
}
