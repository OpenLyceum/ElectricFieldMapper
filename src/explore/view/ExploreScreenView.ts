import type { TReadOnlyProperty } from "scenerystack/axon";
import { Bounds2, Vector2, type Vector2Property } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import {
  DragListener,
  HBox,
  KeyboardListener,
  Node,
  PressListener,
  type PressListenerEvent,
  Rectangle,
  Text,
  VBox,
} from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { Checkbox, RectangularPushButton } from "scenerystack/sun";
import { ChargeRepresentationNode } from "../../common/ChargeRepresentationNode.js";
import {
  FLAT_PANEL_PUSH_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
} from "../../common/ElectricFieldMapperButtonOptions.js";
import { ElectricFieldMapperPanel } from "../../common/ElectricFieldMapperPanel.js";
import ElectricFieldMapperColors from "../../ElectricFieldMapperColors.js";
import {
  CHARGE_TOOLBOX_HEIGHT,
  CHARGE_TOOLBOX_ICON_INSET,
  CHARGE_TOOLBOX_ICON_Y,
  CHARGE_TOOLBOX_WIDTH,
  SCREEN_VIEW_MARGIN,
} from "../../ElectricFieldMapperConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { type ElectricFieldSensor, type ExploreModel, FIELD_BOUNDS, type PointCharge } from "../model/ExploreModel.js";
import { ChargeNode } from "./ChargeNode.js";
import { createFieldSensorDisk, ElectricFieldSensorNode } from "./ElectricFieldSensorNode.js";
import { ExploreScreenSummaryContent } from "./ExploreScreenSummaryContent.js";
import { FieldCanvasNode } from "./FieldCanvasNode.js";
import { createVoltmeterIcon, VoltmeterNode } from "./VoltmeterNode.js";

export type ExploreScreenViewOptions = ScreenViewOptions;

/**
 * Moves a released item back inside the board, `margin` metres from its edges. Only assigns when
 * the position actually changes: a drag can end while its position is still notifying listeners.
 */
function clampToBoard(positionProperty: Vector2Property, margin: number): void {
  const p = positionProperty.value;
  const clamped = new Vector2(
    Math.max(FIELD_BOUNDS.minX + margin, Math.min(FIELD_BOUNDS.maxX - margin, p.x)),
    Math.max(FIELD_BOUNDS.minY + margin, Math.min(FIELD_BOUNDS.maxY - margin, p.y)),
  );
  if (!clamped.equals(p)) {
    positionProperty.value = clamped;
  }
}

export class ExploreScreenView extends ScreenView {
  public constructor(model: ExploreModel, providedOptions?: ExploreScreenViewOptions) {
    super(
      optionize<ExploreScreenViewOptions, EmptySelfOptions, ScreenViewOptions>()(
        { screenSummaryContent: new ExploreScreenSummaryContent(model) },
        providedOptions,
      ),
    );
    const strings = StringManager.getInstance();
    const ui = strings.getUiStrings();
    const a11y = strings.getExploreA11yStrings();
    const bounds = this.layoutBounds;
    this.addChild(
      new Rectangle(0, 0, bounds.width, bounds.height, { fill: ElectricFieldMapperColors.backgroundColorProperty }),
    );

    const boardBounds = new Bounds2(34, 34, 704, 534);
    const board = new Rectangle(boardBounds.minX, boardBounds.minY, boardBounds.width, boardBounds.height, {
      fill: ElectricFieldMapperColors.playAreaColorProperty,
      stroke: ElectricFieldMapperColors.panelBorderColorProperty,
      lineWidth: 2,
      cursor: "crosshair",
      tagName: "div",
      accessibleName: a11y.controls.playAreaStringProperty,
    });
    const mvt = ModelViewTransform2.createSinglePointScaleMapping(new Vector2(0, 0), boardBounds.center, 83);
    const boardPress = new PressListener({
      press: (event) => {
        if (!model.drawModeProperty.value) {
          return;
        }
        const p = mvt.viewToModelPosition(this.globalToLocalPoint(event.pointer.point));
        if (
          p.x >= FIELD_BOUNDS.minX &&
          p.x <= FIELD_BOUNDS.maxX &&
          p.y >= FIELD_BOUNDS.minY &&
          p.y <= FIELD_BOUNDS.maxY &&
          !model.isNearCharge(p)
        ) {
          model.addSeed(p);
        }
      },
    });
    board.addInputListener(boardPress);
    this.addChild(board);
    this.addChild(new FieldCanvasNode(model, mvt, boardBounds));

    // Both boxes are created below; drop handlers only run after construction.
    let chargeBox: Node | null = null;
    let toolBox: Node | null = null;
    const isOver = (box: Node | null, modelPoint: Vector2): boolean =>
      box !== null &&
      this.globalToLocalBounds(box.getGlobalBounds()).containsPoint(mvt.modelToViewPosition(modelPoint));

    // ── Charges ────────────────────────────────────────────────────────────────
    const chargeLayer = new Node();
    const chargeNodes = new Map<PointCharge, ChargeNode>();
    const finishChargeDrag = (charge: PointCharge): void => {
      if (isOver(chargeBox, charge.positionProperty.value)) {
        model.removeCharge(charge);
        return;
      }
      // Charges follow the pointer into the toolbox, but settle inside the field when released elsewhere.
      clampToBoard(charge.positionProperty, 0.18);
    };
    const addChargeNode = (charge: PointCharge): void => {
      const node = new ChargeNode(charge, model, mvt, finishChargeDrag);
      chargeNodes.set(charge, node);
      chargeLayer.addChild(node);
    };
    const removeChargeNode = (charge: PointCharge): void => {
      const node = chargeNodes.get(charge);
      if (node) {
        chargeLayer.removeChild(node);
        node.dispose();
        chargeNodes.delete(charge);
      }
    };
    model.charges.forEach(addChargeNode);
    model.charges.elementAddedEmitter.addListener(addChargeNode);
    model.charges.elementRemovedEmitter.addListener(removeChargeNode);
    this.addChild(chargeLayer);

    // ── Electric field sensors ─────────────────────────────────────────────────
    const sensorLayer = new Node();
    const sensorNodes = new Map<ElectricFieldSensor, ElectricFieldSensorNode>();
    const finishSensorDrag = (sensor: ElectricFieldSensor): void => {
      if (isOver(chargeBox, sensor.positionProperty.value)) {
        model.removeSensor(sensor);
        return;
      }
      clampToBoard(sensor.positionProperty, 0.1);
    };
    const addSensorNode = (sensor: ElectricFieldSensor): void => {
      const node = new ElectricFieldSensorNode(sensor, model, mvt, finishSensorDrag);
      sensorNodes.set(sensor, node);
      sensorLayer.addChild(node);
    };
    const removeSensorNode = (sensor: ElectricFieldSensor): void => {
      const node = sensorNodes.get(sensor);
      if (node) {
        sensorLayer.removeChild(node);
        node.dispose();
        sensorNodes.delete(sensor);
      }
    };
    model.sensors.forEach(addSensorNode);
    model.sensors.elementAddedEmitter.addListener(addSensorNode);
    model.sensors.elementRemovedEmitter.addListener(removeSensorNode);
    this.addChild(sensorLayer);

    // ── Voltmeter ──────────────────────────────────────────────────────────────
    // The voltmeter is large and usually carried by its body, so any overlap with the toolbox puts it away.
    const voltmeter = new VoltmeterNode(model, mvt, () => {
      if (toolBox?.getGlobalBounds().intersectsBounds(voltmeter.getGlobalBounds())) {
        model.voltmeterActiveProperty.value = false;
        return;
      }
      clampToBoard(model.voltmeterPositionProperty, 0.05);
    });
    this.addChild(voltmeter);

    // ── Toolbox items ──────────────────────────────────────────────────────────
    /** Where keyboard-added items appear, staggered so they do not stack exactly. */
    const nextPosition = (count: number) => ({
      x: Math.min(2.8, -0.6 + 0.35 * count),
      y: Math.min(2, -0.6 + 0.2 * (count % 4)),
    });
    /**
     * A toolbox entry: pressing it creates an item at the icon and forwards the press so the
     * new item is dragged straight away; Enter or Space places one for keyboard users.
     */
    const toolboxItem = (
      icon: Node,
      label: TReadOnlyProperty<string> | null,
      accessibleName: TReadOnlyProperty<string>,
      helpText: TReadOnlyProperty<string>,
      startDrag: (event: PressListenerEvent, modelPoint: Vector2) => void,
      placeWithKeyboard: () => void,
    ): Node => {
      const item = new Node({
        cursor: "grab",
        tagName: "button",
        focusable: true,
        accessibleName,
        accessibleHelpText: helpText,
        children: [icon],
      });
      if (label) {
        item.addChild(
          new Text(label, {
            font: "13px sans-serif",
            fill: ElectricFieldMapperColors.textColorProperty,
            centerX: 0,
            top: 21,
            maxWidth: 70,
          }),
        );
      }
      item.addInputListener(
        DragListener.createForwardingListener((event) => {
          const viewPoint = this.globalToLocalPoint(icon.localToGlobalPoint(Vector2.ZERO));
          startDrag(event, mvt.viewToModelPosition(viewPoint));
        }),
      );
      item.addInputListener(new KeyboardListener({ keys: ["enter", "space"], fire: placeWithKeyboard }));
      return item;
    };
    const chargeItem = (q: 1 | -1): Node =>
      toolboxItem(
        new ChargeRepresentationNode(q),
        q > 0 ? ui.positiveOneNcStringProperty : ui.negativeOneNcStringProperty,
        q > 0 ? a11y.controls.positiveChargeStringProperty : a11y.controls.negativeChargeStringProperty,
        a11y.controls.takeChargeStringProperty,
        (event, modelPoint) => {
          const charge = model.addCharge(q, modelPoint);
          const node = chargeNodes.get(charge);
          if (!node?.dragListener.dragListener.press(event, node)) {
            model.removeCharge(charge);
          }
        },
        () => {
          const charge = model.addCharge(q, nextPosition(model.charges.length));
          chargeNodes.get(charge)?.focus();
        },
      );
    const sensorItem = toolboxItem(
      createFieldSensorDisk(),
      ui.sensorsStringProperty,
      a11y.controls.fieldSensorStringProperty,
      a11y.controls.takeFieldSensorStringProperty,
      (event, modelPoint) => {
        const sensor = model.addSensor(modelPoint);
        const node = sensorNodes.get(sensor);
        if (!node?.dragListener.dragListener.press(event, node)) {
          model.removeSensor(sensor);
        }
      },
      () => {
        const p = nextPosition(model.sensors.length);
        const sensor = model.addSensor({ x: p.x + 0.2, y: p.y + 1 });
        sensorNodes.get(sensor)?.focus();
      },
    );
    const positiveItem = chargeItem(1);
    const negativeItem = chargeItem(-1);
    positiveItem.translation = new Vector2(CHARGE_TOOLBOX_ICON_INSET, CHARGE_TOOLBOX_ICON_Y);
    negativeItem.translation = new Vector2(CHARGE_TOOLBOX_WIDTH / 2, CHARGE_TOOLBOX_ICON_Y);
    sensorItem.translation = new Vector2(CHARGE_TOOLBOX_WIDTH - CHARGE_TOOLBOX_ICON_INSET, CHARGE_TOOLBOX_ICON_Y);
    chargeBox = new Node({
      children: [
        new Rectangle(0, 0, CHARGE_TOOLBOX_WIDTH, CHARGE_TOOLBOX_HEIGHT, {
          fill: ElectricFieldMapperColors.playAreaColorProperty,
          stroke: ElectricFieldMapperColors.panelBorderColorProperty,
          lineWidth: 2,
          cornerRadius: 5,
        }),
        positiveItem,
        negativeItem,
        sensorItem,
      ],
    });

    // The voltmeter icon's origin is its crosshair, so a pulled-out voltmeter starts right under it.
    const voltmeterIcon = createVoltmeterIcon({ scale: 0.6 });
    const voltmeterItem = toolboxItem(
      voltmeterIcon,
      null,
      a11y.controls.voltmeterStringProperty,
      a11y.controls.takeVoltmeterStringProperty,
      (event, modelPoint) => {
        model.voltmeterPositionProperty.value = modelPoint;
        model.voltmeterActiveProperty.value = true;
        if (!voltmeter.dragListener.dragListener.press(event, voltmeter)) {
          model.voltmeterActiveProperty.value = false;
        }
      },
      () => {
        model.voltmeterPositionProperty.reset();
        model.voltmeterActiveProperty.value = true;
        voltmeter.dragHandle.focus();
      },
    );
    model.voltmeterActiveProperty.link((active) => {
      voltmeterItem.visible = !active;
    });
    const toolBoxHeight = voltmeterIcon.height + 16;
    voltmeterItem.centerX = CHARGE_TOOLBOX_WIDTH / 2;
    voltmeterItem.top = 8;
    toolBox = new Node({
      children: [
        new Rectangle(0, 0, CHARGE_TOOLBOX_WIDTH, toolBoxHeight, {
          fill: ElectricFieldMapperColors.playAreaColorProperty,
          stroke: ElectricFieldMapperColors.panelBorderColorProperty,
          lineWidth: 2,
          cornerRadius: 5,
        }),
        voltmeterItem,
      ],
    });

    // ── Control panel ──────────────────────────────────────────────────────────
    const button = (label: typeof ui.addPositiveStringProperty, action: () => void) =>
      new RectangularPushButton({
        ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
        content: new Text(label, {
          font: "bold 13px sans-serif",
          fill: ElectricFieldMapperColors.controlSurfaceTextColorProperty,
          maxWidth: 200,
        }),
        accessibleName: label,
        listener: action,
      });
    const check = (property: typeof model.showLinesProperty, label: typeof ui.showLinesStringProperty) =>
      new Checkbox(
        property,
        new Text(label, { font: "14px sans-serif", fill: ElectricFieldMapperColors.textColorProperty, maxWidth: 190 }),
        { checkboxColor: ElectricFieldMapperColors.textColorProperty, spacing: 8, boxWidth: 16, accessibleName: label },
      );
    const heading = (label: typeof ui.chargesStringProperty) =>
      new Text(label, {
        font: "bold 16px sans-serif",
        fill: ElectricFieldMapperColors.textColorProperty,
        maxWidth: 230,
      });
    const removeLast = button(ui.removeLastStringProperty, () => {
      const last = model.charges[model.charges.length - 1];
      if (last) {
        model.removeCharge(last);
      }
    });
    const clearCharges = button(ui.clearChargesStringProperty, () => {
      for (const charge of [...model.charges]) {
        model.removeCharge(charge);
      }
    });
    const seedAtVoltmeter = button(ui.seedAtProbeStringProperty, () => {
      const p = model.voltmeterPositionProperty.value;
      if (!model.isNearCharge(p)) {
        model.addSeed(p);
      }
    });
    model.voltmeterActiveProperty.link((enabled) => {
      seedAtVoltmeter.enabled = enabled;
    });
    const clearLines = button(ui.clearLinesStringProperty, () => model.clearSeeds());
    const panel = new ElectricFieldMapperPanel(
      new VBox({
        align: "left",
        spacing: 7,
        children: [
          heading(ui.chargesStringProperty),
          chargeBox,
          new HBox({ spacing: 6, children: [removeLast, clearCharges] }),
          heading(ui.displayStringProperty),
          check(model.showVectorsProperty, ui.showVectorsStringProperty),
          check(model.showLinesProperty, ui.showLinesStringProperty),
          check(model.automaticLinesProperty, ui.automaticLinesStringProperty),
          check(model.showVoltageProperty, ui.showVoltageStringProperty),
          check(model.showGridProperty, ui.showGridStringProperty),
          heading(ui.drawStringProperty),
          check(model.drawModeProperty, ui.drawModeStringProperty),
          new HBox({ spacing: 6, children: [seedAtVoltmeter, clearLines] }),
          heading(ui.toolsStringProperty),
          toolBox,
        ],
      }),
      { xMargin: 12, yMargin: 10 },
    );
    panel.right = bounds.maxX - SCREEN_VIEW_MARGIN;
    panel.top = SCREEN_VIEW_MARGIN - 6;
    this.addChild(panel);
    // Items dragged out of the boxes must draw above the panel; the voltmeter is the largest, so it goes under sensors.
    voltmeter.moveToFront();
    chargeLayer.moveToFront();
    sensorLayer.moveToFront();

    const hint = new Text(ui.hintStringProperty, {
      font: "14px sans-serif",
      fill: ElectricFieldMapperColors.textColorProperty,
      left: boardBounds.minX,
      top: boardBounds.maxY + 9,
      maxWidth: boardBounds.width,
    });
    this.addChild(hint);
    const reset = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
      },
      right: bounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: bounds.maxY - SCREEN_VIEW_MARGIN,
      accessibleName: a11y.controls.resetStringProperty,
    });
    this.addChild(reset);
    this.addChild(new Node({ pdomOrder: [chargeLayer, sensorLayer, voltmeter, panel, reset] }));
  }
}
