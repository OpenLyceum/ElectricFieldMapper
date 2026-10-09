import { localeProperty } from "scenerystack/joist";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { ExploreModel } from "../src/explore/model/ExploreModel.js";
import { ExploreScreenSummaryContent } from "../src/explore/view/ExploreScreenSummaryContent.js";

const summaries: ExploreScreenSummaryContent[] = [];
const originalStrings = window.phet["chipper"].strings;

// The shared setup registers only English. Register the simulation's other locales for this suite
// so the framework's locale validation does not fall back to English on a language change.
beforeAll(() => {
  window.phet["chipper"].strings = { ...originalStrings, fr: {}, es: {} };
});

afterAll(() => {
  window.phet["chipper"].strings = originalStrings;
});

afterEach(() => {
  for (const summary of summaries) {
    summary.dispose();
  }
  summaries.length = 0;
  localeProperty.value = "en";
});

const createSummary = (model: ExploreModel): ExploreScreenSummaryContent => {
  const summary = new ExploreScreenSummaryContent(model);
  summaries.push(summary);
  return summary;
};

// PatternStringProperty surrounds interpolated numbers with Unicode direction markers.
const readDetails = (summary: ExploreScreenSummaryContent): string | undefined =>
  summary.getVoicingDetailsString()?.replace(/[\u202a\u202c]/g, "");

describe("live screen summary", () => {
  it("updates counts and descriptions when tools, overlays, and drawn lines change", () => {
    const model = new ExploreModel();
    const summary = createSummary(model);
    expect(readDetails(summary)).toContain("2 charges. 0 electric field sensors.");
    model.addCharge(1, { x: 0, y: 1 });
    model.addSensor({ x: 0, y: 0 });
    model.voltmeterActiveProperty.value = true;
    model.measuringTapeActiveProperty.value = true;
    model.showVoltageProperty.value = true;
    model.showValuesProperty.value = true;
    model.addSeed({ x: 0, y: 0 });
    model.addEquipotentialAtVoltmeter();
    expect(readDetails(summary)).toBe(
      "3 charges. 1 electric field sensors. Voltmeter on the board. Measuring tape on the board. " +
        "Voltage map shown. Numeric values shown. 1 drawn field lines. 1 equipotential lines.",
    );
    model.reset();
    expect(readDetails(summary)).toBe(
      "2 charges. 0 electric field sensors. Voltmeter in the toolbox. Measuring tape in the toolbox. " +
        "Voltage map hidden. Numeric values hidden. 0 drawn field lines. 0 equipotential lines.",
    );
  });

  it("changes language immediately and keeps subsequent state updates translated", () => {
    const model = new ExploreModel();
    const summary = createSummary(model);
    localeProperty.value = "fr";
    expect(readDetails(summary)).toContain("0 capteurs de champ électrique.");
    expect(readDetails(summary)).toContain("Le voltmètre est dans la boîte à outils.");
    model.voltmeterActiveProperty.value = true;
    model.showVoltageProperty.value = true;
    expect(readDetails(summary)).toContain("Le voltmètre est dans la zone du champ.");
    expect(readDetails(summary)).toContain("La carte de tension est affichée.");
    localeProperty.value = "es";
    expect(readDetails(summary)).toContain("2 cargas. 0 sensores de campo eléctrico.");
    expect(readDetails(summary)).toContain("El voltímetro está en el tablero.");
    model.showValuesProperty.value = true;
    expect(readDetails(summary)).toContain("Los valores numéricos están visibles.");
  });
});
