import { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Circle, KeyboardListener, Node, RichDragListener, Text } from "scenerystack/scenery";
import ElectricFieldMapperColors from "../../ElectricFieldMapperColors.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ExploreModel, PointCharge } from "../model/ExploreModel.js";

export class ChargeNode extends Node {
  public readonly dragListener: RichDragListener;

  public constructor(
    charge: PointCharge,
    model: ExploreModel,
    mvt: ModelViewTransform2,
    onDrop: (charge: PointCharge) => void,
  ) {
    const a11y = StringManager.getInstance().getExploreA11yStrings();
    super({
      cursor: "grab",
      tagName: "div",
      focusable: true,
      accessibleName:
        charge.q > 0 ? a11y.controls.positiveChargeStringProperty : a11y.controls.negativeChargeStringProperty,
      accessibleHelpText: a11y.controls.moveChargeStringProperty,
    });
    const circle = new Circle(16, {
      fill:
        charge.q > 0
          ? ElectricFieldMapperColors.positiveChargeColorProperty
          : ElectricFieldMapperColors.negativeChargeColorProperty,
      stroke: ElectricFieldMapperColors.chargeOutlineColorProperty,
      lineWidth: 2.5,
    });
    const sign = new Text(charge.q > 0 ? "+" : "−", {
      font: "bold 24px sans-serif",
      fill: ElectricFieldMapperColors.chargeOutlineColorProperty,
      center: Vector2.ZERO,
    });
    this.children = [circle, sign];
    const update = (position: Vector2): void => {
      this.translation = mvt.modelToViewPosition(position);
      model.notifyChanged();
    };
    charge.positionProperty.link(update);
    this.dragListener = new RichDragListener({
      positionProperty: charge.positionProperty,
      transform: mvt,
      dragListenerOptions: { applyOffset: false },
      keyboardDragListenerOptions: { dragSpeed: 90, shiftDragSpeed: 30 },
      end: (event) => {
        if (event) {
          onDrop(charge);
        }
      },
    });
    this.addInputListener(this.dragListener);
    const removeWithKeyboard = new KeyboardListener({
      keys: ["delete", "backspace"],
      fire: () => model.removeCharge(charge),
    });
    this.addInputListener(removeWithKeyboard);
    this.disposeEmitter.addListener(() => {
      charge.positionProperty.unlink(update);
      this.removeInputListener(this.dragListener);
      this.dragListener.dispose();
      this.removeInputListener(removeWithKeyboard);
      removeWithKeyboard.dispose();
      circle.dispose();
      sign.dispose();
    });
  }
}
