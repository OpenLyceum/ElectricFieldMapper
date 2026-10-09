import { toFixed, type Vector2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { Circle, KeyboardListener, Node, type NodeOptions, RichDragListener, Text } from "scenerystack/scenery";
import { ArrowNode } from "scenerystack/scenery-phet";
import { REMOVE_ITEM_HOTKEY_DATA } from "../../common/ElectricFieldMapperHotkeyData.js";
import ElectricFieldMapperColors from "../../ElectricFieldMapperColors.js";
import { FIELD_SENSOR_VIEW_RADIUS } from "../../ElectricFieldMapperConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ElectricFieldSensor, ExploreModel } from "../model/ExploreModel.js";
import { electricField } from "../model/FieldPhysics.js";
import { formatSignificant } from "./formatReadout.js";

/** Screen pixels of arrow per V/m, and the longest arrow drawn (near a charge the field grows without bound). */
const ARROW_PIXELS_PER_VOLT_PER_METRE = 12;
const MAX_ARROW_LENGTH = 300;

/** The yellow sensor disk on its own, as shown in the toolbox and at the centre of a placed sensor. */
export function createFieldSensorDisk(options?: NodeOptions): Node {
  return new Circle(FIELD_SENSOR_VIEW_RADIUS, {
    fill: ElectricFieldMapperColors.fieldSensorFillColorProperty,
    stroke: ElectricFieldMapperColors.fieldSensorStrokeColorProperty,
    ...options,
  });
}

/** A draggable sensor that shows the local E vector as a red arrow with its magnitude and direction. */
export class ElectricFieldSensorNode extends Node {
  public readonly dragListener: RichDragListener;

  public constructor(
    sensor: ElectricFieldSensor,
    model: ExploreModel,
    mvt: ModelViewTransform2,
    onDrop: (sensor: ElectricFieldSensor) => void,
  ) {
    const strings = StringManager.getInstance();
    const a11y = strings.getExploreA11yStrings();
    const ui = strings.getUiStrings();
    super({
      cursor: "grab",
      tagName: "div",
      focusable: true,
      accessibleName: a11y.controls.fieldSensorStringProperty,
      accessibleHelpText: a11y.controls.moveFieldSensorStringProperty,
    });
    const disk = createFieldSensorDisk();
    this.touchArea = disk.localBounds.dilated(10);
    const arrow = new ArrowNode(0, 0, 1, 0, {
      pickable: false,
      fill: ElectricFieldMapperColors.fieldSensorArrowColorProperty,
      stroke: ElectricFieldMapperColors.fieldSensorArrowColorProperty,
      headHeight: 10,
      headWidth: 12,
      tailWidth: 4,
    });
    const labelOptions = {
      font: "14px sans-serif",
      fill: ElectricFieldMapperColors.fieldSensorLabelColorProperty,
      pickable: false,
    };
    const strengthText = new Text("", labelOptions);
    const angleText = new Text("", labelOptions);
    this.children = [arrow, disk, angleText, strengthText];

    const update = (): void => {
      const position = sensor.positionProperty.value;
      this.translation = mvt.modelToViewPosition(position);
      const e = electricField(model.getSnapshot(), position);
      const magnitude = Math.hypot(e.x, e.y);
      if (!Number.isFinite(magnitude)) {
        // Inside a charge disk the point-charge field is undefined.
        arrow.visible = false;
        strengthText.string = "–";
        angleText.string = "–";
      } else {
        const length = Math.min(MAX_ARROW_LENGTH, ARROW_PIXELS_PER_VOLT_PER_METRE * magnitude);
        arrow.visible = length > 1;
        arrow.setTailAndTip(0, 0, (length * e.x) / (magnitude || 1), (length * e.y) / (magnitude || 1));
        // Model y points down like the view; report the angle counterclockwise from +x as on paper.
        const degrees = toFixed((Math.atan2(-e.y, e.x) * 180) / Math.PI, 1);
        strengthText.string = `${formatSignificant(magnitude)} V/m`;
        angleText.string = magnitude > 0 ? `${degrees}°` : "";
      }
      strengthText.centerX = 0;
      strengthText.bottom = -FIELD_SENSOR_VIEW_RADIUS - 2;
      angleText.centerX = 0;
      angleText.bottom = strengthText.top;
    };
    const updatePosition = (_position: Vector2): void => update();
    sensor.positionProperty.link(updatePosition);
    model.changeCountProperty.lazyLink(update);
    const showLabels = (visible: boolean): void => {
      strengthText.visible = visible;
      angleText.visible = visible;
    };
    model.showValuesProperty.link(showLabels);

    this.dragListener = new RichDragListener({
      positionProperty: sensor.positionProperty,
      transform: mvt,
      dragListenerOptions: { applyOffset: false },
      keyboardDragListenerOptions: {
        dragSpeed: 90,
        shiftDragSpeed: 30,
        dragBoundsProperty: model.keyboardDragBoundsProperty,
      },
      end: (event) => {
        if (event) {
          onDrop(sensor);
        }
      },
    });
    this.addInputListener(this.dragListener);
    // Announce the reading once the sensor is released. (Changing PDOM content on every move would
    // rebuild the focused element and interrupt a keyboard drag.)
    const announceReading = (pressed: boolean): void => {
      if (!pressed) {
        this.addAccessibleObjectResponse(
          `${ui.fieldStrengthStringProperty.value} ${strengthText.string}, ` +
            `${ui.directionStringProperty.value} ${angleText.string}`,
        );
      }
    };
    this.dragListener.isPressedProperty.lazyLink(announceReading);
    const removeWithKeyboard = new KeyboardListener({
      keyStringProperties: REMOVE_ITEM_HOTKEY_DATA.keyStringProperties,
      fire: () => {
        this.interruptSubtreeInput();
        model.removeSensor(sensor);
      },
    });
    this.addInputListener(removeWithKeyboard);

    this.disposeEmitter.addListener(() => {
      sensor.positionProperty.unlink(updatePosition);
      model.changeCountProperty.unlink(update);
      model.showValuesProperty.unlink(showLabels);
      this.dragListener.isPressedProperty.unlink(announceReading);
      this.removeInputListener(this.dragListener);
      this.dragListener.dispose();
      this.removeInputListener(removeWithKeyboard);
      removeWithKeyboard.dispose();
      arrow.dispose();
      disk.dispose();
      strengthText.dispose();
      angleText.dispose();
    });
  }
}
