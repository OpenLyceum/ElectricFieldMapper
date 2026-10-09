import type { Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { KeyboardListener, Node, RichDragListener } from "scenerystack/scenery";
import { ChargeRepresentationNode } from "../../common/ChargeRepresentationNode.js";
import { REMOVE_ITEM_HOTKEY_DATA } from "../../common/ElectricFieldMapperHotkeyData.js";
import { GRID_SPACING_M } from "../../ElectricFieldMapperConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ExploreModel, PointCharge } from "../model/ExploreModel.js";

/** Keyboard movement per key press or repeat, in view pixels when snapping is off. */
const KEYBOARD_DRAG_DELTA = 10;
const SHIFT_KEYBOARD_DRAG_DELTA = 3;

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
    const sphere = new ChargeRepresentationNode(charge.q);
    this.children = [sphere];
    this.touchArea = sphere.localBounds.dilated(6);
    const update = (position: Vector2): void => {
      this.translation = mvt.modelToViewPosition(position);
      model.notifyChanged();
    };
    charge.positionProperty.link(update);
    this.dragListener = new RichDragListener({
      positionProperty: charge.positionProperty,
      transform: mvt,
      dragListenerOptions: {
        applyOffset: false,
        mapPosition: (position) => (model.snapToGridProperty.value ? model.snapPosition(position) : position),
        end: (event) => {
          if (event) {
            onDrop(charge);
          }
        },
      },
      keyboardDragListenerOptions: {
        dragDelta: KEYBOARD_DRAG_DELTA,
        shiftDragDelta: SHIFT_KEYBOARD_DRAG_DELTA,
        // A custom mapping must apply the bounds itself: mapPosition replaces dragBoundsProperty.
        mapPosition: (position) => {
          const bounded = model.keyboardDragBoundsProperty.value.closestPointTo(position);
          return model.snapToGridProperty.value ? model.snapPosition(bounded) : bounded;
        },
      },
    });
    // Each snapped key press advances one whole grid square, including with Shift held.
    const updateKeyboardSteps = (snap: boolean): void => {
      const gridStep = Math.abs(mvt.modelToViewDeltaX(GRID_SPACING_M));
      this.dragListener.keyboardDragListener.dragDelta = snap ? gridStep : KEYBOARD_DRAG_DELTA;
      this.dragListener.keyboardDragListener.shiftDragDelta = snap ? gridStep : SHIFT_KEYBOARD_DRAG_DELTA;
    };
    model.snapToGridProperty.link(updateKeyboardSteps);
    this.addInputListener(this.dragListener);
    const removeWithKeyboard = new KeyboardListener({
      keyStringProperties: REMOVE_ITEM_HOTKEY_DATA.keyStringProperties,
      fire: () => {
        this.interruptSubtreeInput();
        model.removeCharge(charge);
      },
    });
    this.addInputListener(removeWithKeyboard);
    this.disposeEmitter.addListener(() => {
      charge.positionProperty.unlink(update);
      model.snapToGridProperty.unlink(updateKeyboardSteps);
      this.removeInputListener(this.dragListener);
      this.dragListener.dispose();
      this.removeInputListener(removeWithKeyboard);
      removeWithKeyboard.dispose();
      sphere.dispose();
    });
  }
}
