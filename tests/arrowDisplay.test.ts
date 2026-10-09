import { describe, expect, it } from "vitest";
import {
  arrowDisplay,
  LINEAR_ARROW_MAX_LENGTH,
  LINEAR_ARROW_MIN_LENGTH,
  LINEAR_ARROW_REFERENCE_VM,
} from "../src/explore/view/arrowDisplay.js";

describe("sampled arrow display", () => {
  it("draws direction-only arrows at one length", () => {
    expect(arrowDisplay(1, "direction")).toEqual(arrowDisplay(1000, "direction"));
    expect(arrowDisplay(1, "direction").length).toBe(14);
  });

  it("compresses magnitude with a logarithm and caps the length", () => {
    const weak = arrowDisplay(1, "compressed");
    const strong = arrowDisplay(1e6, "compressed");
    expect(strong.length).toBeGreaterThan(weak.length);
    expect(strong.length).toBeLessThanOrEqual(16);
    expect(weak.opacity).toBeGreaterThanOrEqual(0.2);
    expect(strong.opacity).toBeLessThanOrEqual(0.95);
  });

  it("grows clipped-linear arrows with field strength up to a cap", () => {
    expect(arrowDisplay(LINEAR_ARROW_REFERENCE_VM, "linear").length).toBe(LINEAR_ARROW_MAX_LENGTH);
    expect(arrowDisplay(LINEAR_ARROW_REFERENCE_VM * 4, "linear").length).toBe(LINEAR_ARROW_MAX_LENGTH);
    expect(arrowDisplay(LINEAR_ARROW_REFERENCE_VM / 2, "linear").length).toBeCloseTo(LINEAR_ARROW_MAX_LENGTH / 2);
    expect(arrowDisplay(0.2, "linear").length).toBe(LINEAR_ARROW_MIN_LENGTH);
    expect(arrowDisplay(LINEAR_ARROW_REFERENCE_VM, "linear").length).toBeGreaterThan(
      arrowDisplay(LINEAR_ARROW_REFERENCE_VM / 4, "linear").length,
    );
  });
});
