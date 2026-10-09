import { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Node, Text } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import ElectricFieldMapperColors from "../../ElectricFieldMapperColors.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ExploreModel } from "../model/ExploreModel.js";

/** Length of the scale arrow (metres). It spans two major grid squares. */
const ARROW_LENGTH_M = 1;

/**
 * Preferred model position of the arrow's top-left. Model y increases downward, so this sits below
 * the origin, in the same part of the board as Charges and Fields' scale arrow.
 */
const ARROW_POSITION = new Vector2(2, 2.2);

/**
 * Double-headed arrow and "1 meter" label that show the grid scale while Values is selected.
 * Hidden with the grid, as in Charges and Fields.
 */
export class GridScaleNode extends Node {
  public constructor(model: ExploreModel, mvt: ModelViewTransform2) {
    super({ pickable: false });
    const ui = StringManager.getInstance().getUiStrings();
    const length = mvt.modelToViewDeltaX(ARROW_LENGTH_M);
    const arrow = new ArrowNode(0, 0, length, 0, {
      doubleHead: true,
      fill: ElectricFieldMapperColors.gridScaleArrowFillColorProperty,
      stroke: ElectricFieldMapperColors.gridScaleArrowStrokeColorProperty,
    });
    const label = new Text(ui.oneMeterStringProperty, {
      font: "12px sans-serif",
      fill: ElectricFieldMapperColors.gridScaleTextColorProperty,
      maxWidth: length + 24,
    });
    this.children = [arrow, label];

    const layout = (): void => {
      const bounds = model.fieldBoundsProperty.value;
      const x = Math.min(bounds.maxX - ARROW_LENGTH_M - 0.15, Math.max(bounds.minX + 0.15, ARROW_POSITION.x));
      const y = Math.min(bounds.maxY - 0.55, Math.max(bounds.minY + 0.1, ARROW_POSITION.y));
      const origin = mvt.modelToViewPosition(new Vector2(x, y));
      arrow.left = origin.x;
      arrow.top = origin.y;
      label.centerX = arrow.centerX;
      label.top = arrow.bottom;
    };
    model.fieldBoundsProperty.link(layout);
    ui.oneMeterStringProperty.link(layout);

    const updateVisible = (): void => {
      this.visible = model.showValuesProperty.value && model.showGridProperty.value;
    };
    model.showValuesProperty.link(updateVisible);
    model.showGridProperty.link(updateVisible);
  }
}
