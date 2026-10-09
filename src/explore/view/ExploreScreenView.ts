import { DerivedProperty } from "scenerystack/axon";
import { Bounds2, Vector2 } from "scenerystack/dot";
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import { ModelViewTransform2 } from "scenerystack/phetcommon";
import {
  Circle,
  DragListener,
  HBox,
  KeyboardListener,
  Node,
  PressListener,
  Rectangle,
  RichDragListener,
  Text,
  VBox,
} from "scenerystack/scenery";
import { ResetAllButton } from "scenerystack/scenery-phet";
import { ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { Checkbox, ComboBox, RectangularPushButton } from "scenerystack/sun";
import {
  FLAT_PANEL_PUSH_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
} from "../../common/ElectricFieldMapperButtonOptions.js";
import { ElectricFieldMapperPanel } from "../../common/ElectricFieldMapperPanel.js";
import ElectricFieldMapperColors from "../../ElectricFieldMapperColors.js";
import {
  CHARGE_TOOLBOX_HEIGHT,
  CHARGE_TOOLBOX_ICON_X,
  CHARGE_TOOLBOX_ICON_Y,
  CHARGE_TOOLBOX_WIDTH,
  GRID_SPACING_M,
  SCREEN_VIEW_MARGIN,
} from "../../ElectricFieldMapperConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import { type ExploreModel, FIELD_BOUNDS, type PointCharge } from "../model/ExploreModel.js";
import { electricField, electricPotential } from "../model/FieldPhysics.js";
import { ChargeNode } from "./ChargeNode.js";
import { ExploreScreenSummaryContent } from "./ExploreScreenSummaryContent.js";
import { FieldCanvasNode } from "./FieldCanvasNode.js";

export type ExploreScreenViewOptions = ScreenViewOptions;

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

    const chargeLayer = new Node();
    const chargeNodes = new Map<PointCharge, ChargeNode>();
    let chargeBox: Node | null = null;
    const finishChargeDrag = (charge: PointCharge): void => {
      const position = charge.positionProperty.value;
      const viewPosition = mvt.modelToViewPosition(position);
      if (chargeBox && this.globalToLocalBounds(chargeBox.getGlobalBounds()).containsPoint(viewPosition)) {
        model.removeCharge(charge);
        return;
      }
      // Charges follow the pointer into the toolbox, but settle inside the field when released elsewhere.
      const margin = model.snapToGridProperty.value ? GRID_SPACING_M : 0.18;
      const clamped = new Vector2(
        Math.max(FIELD_BOUNDS.minX + margin, Math.min(FIELD_BOUNDS.maxX - margin, position.x)),
        Math.max(FIELD_BOUNDS.minY + margin, Math.min(FIELD_BOUNDS.maxY - margin, position.y)),
      );
      charge.positionProperty.value = model.snapToGridProperty.value ? model.snapPosition(clamped) : clamped;
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

    const probe = new Node({
      cursor: "grab",
      tagName: "div",
      focusable: true,
      accessibleName: a11y.controls.probeStringProperty,
      accessibleHelpText: a11y.controls.moveProbeStringProperty,
      children: [
        new Circle(13, {
          fill: ElectricFieldMapperColors.probeColorProperty,
          stroke: ElectricFieldMapperColors.probeDetailColorProperty,
          lineWidth: 2,
        }),
        new Circle(3, { fill: ElectricFieldMapperColors.probeDetailColorProperty }),
      ],
    });
    model.probePositionProperty.link((p) => {
      probe.translation = mvt.modelToViewPosition(p);
    });
    probe.addInputListener(
      new RichDragListener({
        positionProperty: model.probePositionProperty,
        transform: mvt,
        mapPosition: (p) =>
          new Vector2(
            Math.max(FIELD_BOUNDS.minX + 0.16, Math.min(FIELD_BOUNDS.maxX - 0.16, p.x)),
            Math.max(FIELD_BOUNDS.minY + 0.16, Math.min(FIELD_BOUNDS.maxY - 0.16, p.y)),
          ),
        dragListenerOptions: {},
        keyboardDragListenerOptions: { dragSpeed: 90, shiftDragSpeed: 30 },
      }),
    );
    this.addChild(probe);

    const button = (label: typeof ui.addPositiveStringProperty, action: () => void, name = label) =>
      new RectangularPushButton({
        ...FLAT_PANEL_PUSH_BUTTON_OPTIONS,
        content: new Text(label, {
          font: "bold 13px sans-serif",
          fill: ElectricFieldMapperColors.controlSurfaceTextColorProperty,
        }),
        accessibleName: name,
        listener: action,
      });
    const check = (property: typeof model.showLinesProperty, label: typeof ui.showLinesStringProperty) =>
      new Checkbox(
        property,
        new Text(label, { font: "14px sans-serif", fill: ElectricFieldMapperColors.textColorProperty }),
        { checkboxColor: ElectricFieldMapperColors.textColorProperty, spacing: 8, accessibleName: label },
      );
    const nextPosition = () => {
      const i = model.charges.length;
      return { x: Math.min(2.8, -0.6 + 0.35 * i), y: Math.min(2, -0.6 + 0.2 * (i % 4)) };
    };
    const chargeIcon = (q: 1 | -1): Node => {
      const icon = new Node({
        cursor: "grab",
        tagName: "button",
        focusable: true,
        accessibleName: q > 0 ? a11y.controls.positiveChargeStringProperty : a11y.controls.negativeChargeStringProperty,
        accessibleHelpText: a11y.controls.takeChargeStringProperty,
        children: [
          new Circle(16, {
            fill:
              q > 0
                ? ElectricFieldMapperColors.positiveChargeColorProperty
                : ElectricFieldMapperColors.negativeChargeColorProperty,
            stroke: ElectricFieldMapperColors.chargeOutlineColorProperty,
            lineWidth: 2.5,
          }),
          new Text(q > 0 ? "+" : "−", {
            font: "bold 24px sans-serif",
            fill: ElectricFieldMapperColors.chargeOutlineColorProperty,
            center: Vector2.ZERO,
          }),
          new Text(q > 0 ? ui.positiveOneNcStringProperty : ui.negativeOneNcStringProperty, {
            font: "13px sans-serif",
            fill: ElectricFieldMapperColors.textColorProperty,
            centerX: 0,
            top: 21,
          }),
        ],
      });
      icon.translation = new Vector2(
        q > 0 ? CHARGE_TOOLBOX_ICON_X : CHARGE_TOOLBOX_WIDTH - CHARGE_TOOLBOX_ICON_X,
        CHARGE_TOOLBOX_ICON_Y,
      );
      icon.addInputListener(
        DragListener.createForwardingListener((event) => {
          const viewPoint = this.globalToLocalPoint(icon.localToGlobalPoint(Vector2.ZERO));
          const charge = model.addCharge(q, mvt.viewToModelPosition(viewPoint));
          const node = chargeNodes.get(charge);
          if (!node?.dragListener.dragListener.press(event, node)) {
            model.removeCharge(charge);
          }
        }),
      );
      icon.addInputListener(
        new KeyboardListener({
          keys: ["enter", "space"],
          fire: () => {
            const charge = model.addCharge(q, nextPosition());
            chargeNodes.get(charge)?.focus();
          },
        }),
      );
      return icon;
    };
    chargeBox = new Node({
      children: [
        new Rectangle(0, 0, CHARGE_TOOLBOX_WIDTH, CHARGE_TOOLBOX_HEIGHT, {
          fill: ElectricFieldMapperColors.playAreaColorProperty,
          stroke: ElectricFieldMapperColors.panelBorderColorProperty,
          lineWidth: 2,
          cornerRadius: 5,
        }),
        chargeIcon(1),
        chargeIcon(-1),
      ],
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
    const comboListParent = new Node();
    const presetLabels = ui.presets;
    const presetItems = (
      [
        ["custom", presetLabels.customStringProperty],
        ["dipole", presetLabels.dipoleStringProperty],
        ["likePair", presetLabels.likePairStringProperty],
        ["line", presetLabels.lineStringProperty],
        ["alternatingLine", presetLabels.alternatingLineStringProperty],
        ["square", presetLabels.squareStringProperty],
        ["quadrupole", presetLabels.quadrupoleStringProperty],
        ["parallelPlates", presetLabels.parallelPlatesStringProperty],
      ] as const
    ).map(([value, label]) => ({
      value,
      createNode: () => new Text(label, { font: "14px sans-serif", fill: ElectricFieldMapperColors.textColorProperty }),
      accessibleName: label,
    }));
    const chargePresets = new ComboBox(model.presetProperty, presetItems, comboListParent, {
      accessibleName: a11y.controls.chargePresetsStringProperty,
      buttonFill: ElectricFieldMapperColors.playAreaColorProperty,
      buttonStroke: ElectricFieldMapperColors.panelBorderColorProperty,
      listFill: ElectricFieldMapperColors.playAreaColorProperty,
      listStroke: ElectricFieldMapperColors.panelBorderColorProperty,
    });
    const snapToGrid = check(model.snapToGridProperty, ui.snapToGridStringProperty);
    const showVectors = check(model.showVectorsProperty, ui.showVectorsStringProperty);
    const showLines = check(model.showLinesProperty, ui.showLinesStringProperty);
    const automaticLines = check(model.automaticLinesProperty, ui.automaticLinesStringProperty);
    const showGrid = check(model.showGridProperty, ui.showGridStringProperty);
    const drawMode = check(model.drawModeProperty, ui.drawModeStringProperty);
    const seedAtProbe = button(ui.seedAtProbeStringProperty, () => {
      const p = model.probePositionProperty.value;
      if (!model.isNearCharge(p)) {
        model.addSeed(p);
      }
    });
    const clearLines = button(ui.clearLinesStringProperty, () => model.clearSeeds());
    const fieldReadout = new DerivedProperty(
      [model.changeCountProperty, model.probePositionProperty, ui.fieldStrengthStringProperty],
      () => {
        const p = model.probePositionProperty.value;
        const field = electricField(model.getSnapshot(), p);
        const strength = Math.hypot(field.x, field.y);
        return `${ui.fieldStrengthStringProperty.value} ${Number.isFinite(strength) ? strength.toFixed(2) : "∞"} V/m`;
      },
    );
    const potentialReadout = new DerivedProperty(
      [model.changeCountProperty, model.probePositionProperty, ui.potentialStringProperty],
      () => {
        const potential = electricPotential(model.getSnapshot(), model.probePositionProperty.value);
        return `${ui.potentialStringProperty.value} ${Number.isFinite(potential) ? potential.toFixed(2) : "∞"} V`;
      },
    );
    const panel = new ElectricFieldMapperPanel(
      new VBox({
        align: "left",
        spacing: 5,
        children: [
          new Text(ui.chargesStringProperty, {
            font: "bold 18px sans-serif",
            fill: ElectricFieldMapperColors.textColorProperty,
          }),
          chargeBox,
          new HBox({ spacing: 6, children: [removeLast, clearCharges] }),
          new Text(ui.chargePresetsStringProperty, {
            font: "bold 14px sans-serif",
            fill: ElectricFieldMapperColors.textColorProperty,
          }),
          chargePresets,
          snapToGrid,
          new Text(ui.displayStringProperty, {
            font: "bold 18px sans-serif",
            fill: ElectricFieldMapperColors.textColorProperty,
          }),
          showVectors,
          showLines,
          automaticLines,
          showGrid,
          new Text(ui.drawStringProperty, {
            font: "bold 18px sans-serif",
            fill: ElectricFieldMapperColors.textColorProperty,
          }),
          drawMode,
          seedAtProbe,
          clearLines,
          new Text(ui.probeStringProperty, {
            font: "bold 18px sans-serif",
            fill: ElectricFieldMapperColors.textColorProperty,
          }),
          new Text(fieldReadout, { font: "14px sans-serif", fill: ElectricFieldMapperColors.textColorProperty }),
          new Text(potentialReadout, { font: "14px sans-serif", fill: ElectricFieldMapperColors.textColorProperty }),
        ],
      }),
      { xMargin: 12, yMargin: 12 },
    );
    panel.right = bounds.maxX - SCREEN_VIEW_MARGIN;
    panel.top = SCREEN_VIEW_MARGIN;
    this.addChild(panel);
    this.addChild(comboListParent);
    chargeLayer.moveToFront();

    const hint = new Text(ui.hintStringProperty, {
      font: "14px sans-serif",
      fill: ElectricFieldMapperColors.textColorProperty,
      left: boardBounds.minX,
      top: boardBounds.maxY + 9,
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
    this.addChild(new Node({ pdomOrder: [chargeLayer, probe, panel, reset] }));
  }
}
