import { Line, Node, Rectangle, Text } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import ElectricFieldMapperColors from "../ElectricFieldMapperColors.js";
import { ELECTRIC_FIELD_MAPPER_SCREEN_ICONS_SETTINGS } from "../ElectricFieldMapperConstants.js";
import { ChargeRepresentationNode } from "./ChargeRepresentationNode.js";

const WIDTH: number = ELECTRIC_FIELD_MAPPER_SCREEN_ICONS_SETTINGS.WIDTH;
const HEIGHT: number = ELECTRIC_FIELD_MAPPER_SCREEN_ICONS_SETTINGS.HEIGHT;

export function createExploreIcon(): ScreenIcon {
  const children: Node[] = [
    new Rectangle(0, 0, WIDTH, HEIGHT, { fill: ElectricFieldMapperColors.playAreaColorProperty }),
  ];
  for (const offset of [-76, -38, 0, 38, 76]) {
    children.push(
      new Line(
        ELECTRIC_FIELD_MAPPER_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_START_X,
        186 + offset * 0.35,
        ELECTRIC_FIELD_MAPPER_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_END_X,
        186 + offset * 0.35,
        {
          stroke: ElectricFieldMapperColors.fieldLineColorProperty,
          lineWidth: ELECTRIC_FIELD_MAPPER_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_LINE_WIDTH,
        },
      ),
    );
    children.push(
      new Text("▶", {
        font: "bold 18px sans-serif",
        fill: ElectricFieldMapperColors.fieldLineColorProperty,
        centerX: ELECTRIC_FIELD_MAPPER_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_CENTER_X,
        centerY:
          ELECTRIC_FIELD_MAPPER_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_CENTER_Y_OFFSET +
          offset * ELECTRIC_FIELD_MAPPER_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_CENTER_Y_FACTOR,
      }),
    );
  }
  children.push(
    new ChargeRepresentationNode(1, 36, {
      centerX: ELECTRIC_FIELD_MAPPER_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_CENTER_X_VARIANT_2,
      centerY: ELECTRIC_FIELD_MAPPER_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_CENTER_Y,
    }),
  );
  children.push(
    new ChargeRepresentationNode(-1, 36, {
      centerX: ELECTRIC_FIELD_MAPPER_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_CENTER_X_VARIANT_3,
      centerY: ELECTRIC_FIELD_MAPPER_SCREEN_ICONS_SETTINGS.CREATE_EXPLORE_ICON_CENTER_Y,
    }),
  );
  return new ScreenIcon(new Node({ children }), {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: ElectricFieldMapperColors.backgroundColorProperty,
  });
}
