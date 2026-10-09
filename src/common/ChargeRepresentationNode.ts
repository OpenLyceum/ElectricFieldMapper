import { Shape } from "scenerystack/kite";
import { Circle, Node, type NodeOptions, Path, RadialGradient } from "scenerystack/scenery";
import ElectricFieldMapperColors from "../ElectricFieldMapperColors.js";
import { CHARGE_VIEW_RADIUS } from "../ElectricFieldMapperConstants.js";

/**
 * Shaded sphere with a stroked + or − sign, matching the charges in PhET's Charges and Fields.
 * Positive charges are red, negative charges are blue; both share the same size and shading.
 */
export class ChargeRepresentationNode extends Node {
  public constructor(q: 1 | -1, radius = CHARGE_VIEW_RADIUS, options?: NodeOptions) {
    super(options);
    const positive = q > 0;
    const fill = new RadialGradient(0, 0, radius * 0.2, 0, 0, radius)
      .addColorStop(
        0,
        positive
          ? ElectricFieldMapperColors.positiveChargeHighlightColorProperty
          : ElectricFieldMapperColors.negativeChargeHighlightColorProperty,
      )
      .addColorStop(
        0.5,
        positive
          ? ElectricFieldMapperColors.positiveChargeColorProperty
          : ElectricFieldMapperColors.negativeChargeColorProperty,
      )
      .addColorStop(
        1,
        positive
          ? ElectricFieldMapperColors.positiveChargeEdgeColorProperty
          : ElectricFieldMapperColors.negativeChargeEdgeColorProperty,
      );
    const arm = radius * 0.6;
    const signShape = new Shape().moveTo(-arm, 0).lineTo(arm, 0);
    if (positive) {
      signShape.moveTo(0, -arm).lineTo(0, arm);
    }
    this.children = [
      new Circle(radius, { fill }),
      new Path(signShape, {
        stroke: ElectricFieldMapperColors.chargeSignColorProperty,
        lineWidth: radius * 0.3,
        pickable: false,
      }),
    ];
  }

  public override dispose(): void {
    for (const child of this.children) {
      child.dispose();
    }
    super.dispose();
  }
}
