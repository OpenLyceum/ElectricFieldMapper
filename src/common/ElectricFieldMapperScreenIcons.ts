import { Circle, Line, Node, Rectangle, Text } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import ElectricFieldMapperColors from "../ElectricFieldMapperColors.js";

const WIDTH = 548;
const HEIGHT = 373;

export function createExploreIcon(): ScreenIcon {
  const children: Node[] = [
    new Rectangle(0, 0, WIDTH, HEIGHT, { fill: ElectricFieldMapperColors.playAreaColorProperty }),
  ];
  for (const offset of [-76, -38, 0, 38, 76]) {
    children.push(
      new Line(182, 186 + offset * 0.35, 366, 186 + offset * 0.35, {
        stroke: ElectricFieldMapperColors.fieldLineColorProperty,
        lineWidth: 3,
      }),
    );
    children.push(
      new Text("▶", {
        font: "bold 18px sans-serif",
        fill: ElectricFieldMapperColors.fieldLineColorProperty,
        centerX: 274,
        centerY: 186 + offset * 0.35,
      }),
    );
  }
  children.push(
    new Circle(36, {
      fill: ElectricFieldMapperColors.positiveChargeColorProperty,
      stroke: ElectricFieldMapperColors.chargeOutlineColorProperty,
      lineWidth: 3,
      centerX: 174,
      centerY: 186,
    }),
  );
  children.push(
    new Circle(36, {
      fill: ElectricFieldMapperColors.negativeChargeColorProperty,
      stroke: ElectricFieldMapperColors.chargeOutlineColorProperty,
      lineWidth: 3,
      centerX: 374,
      centerY: 186,
    }),
  );
  children.push(
    new Text("+", {
      font: "bold 46px sans-serif",
      fill: ElectricFieldMapperColors.chargeOutlineColorProperty,
      centerX: 174,
      centerY: 184,
    }),
  );
  children.push(
    new Text("−", {
      font: "bold 46px sans-serif",
      fill: ElectricFieldMapperColors.chargeOutlineColorProperty,
      centerX: 374,
      centerY: 184,
    }),
  );
  return new ScreenIcon(new Node({ children }), {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: ElectricFieldMapperColors.backgroundColorProperty,
  });
}
