import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import {
  Circle,
  HBox,
  KeyboardListener,
  Node,
  type NodeOptions,
  Path,
  Rectangle,
  RichDragListener,
  Text,
  VBox,
} from "scenerystack/scenery";
import { EraserButton } from "scenerystack/scenery-phet";
import { RectangularPushButton } from "scenerystack/sun";
import ElectricFieldMapperColors from "../../ElectricFieldMapperColors.js";
import { VOLTMETER_CROSSHAIR_RADIUS } from "../../ElectricFieldMapperConstants.js";
import { StringManager } from "../../i18n/StringManager.js";
import type { ExploreModel } from "../model/ExploreModel.js";
import { electricPotential } from "../model/FieldPhysics.js";
import { formatSignificant } from "./formatReadout.js";
import { potentialCSS } from "./potentialColor.js";

const R = VOLTMETER_CROSSHAIR_RADIUS;
const BODY_WIDTH = 112;
const BUTTON_BASE_COLOR = "#f2f2f2";

/** Crosshair ring and the mount below it; the origin is the measuring point. */
function createCrosshair(): { node: Node; ring: Circle } {
  const ring = new Circle(R, { lineWidth: 3, stroke: ElectricFieldMapperColors.voltmeterCrosshairColorProperty });
  const crosshair = new Path(new Shape().moveTo(-R, 0).lineTo(R, 0).moveTo(0, -R).lineTo(0, R), {
    stroke: ElectricFieldMapperColors.voltmeterCrosshairColorProperty,
  });
  const mount = new Rectangle(-0.2 * R, R, 0.4 * R, 0.4 * R, {
    fill: ElectricFieldMapperColors.voltmeterCrosshairColorProperty,
  });
  return { node: new Node({ children: [mount, ring, crosshair] }), ring };
}

function createBody(content: Node): Node {
  const background = new Rectangle(0, 0, BODY_WIDTH, Math.max(40, content.height + 16), 8, 8, {
    fill: ElectricFieldMapperColors.voltmeterBodyColorProperty,
    stroke: ElectricFieldMapperColors.voltmeterBodyStrokeColorProperty,
    lineWidth: 2,
    centerX: 0,
    top: 1.4 * R,
  });
  content.center = background.center;
  return new Node({ children: [background, content] });
}

/** A small pencil, drawn tip-down-left, for the "plot equipotential" button. */
function createPencilIcon(): Node {
  const body = new Rectangle(0, -3.5, 16, 7, { fill: "#f5c542", stroke: "#6b5310", lineWidth: 1 });
  const eraser = new Rectangle(16, -3.5, 4, 7, { fill: "#e88a9a", stroke: "#6b5310", lineWidth: 1 });
  const tip = new Path(new Shape().moveTo(0, -3.5).lineTo(-7, 0).lineTo(0, 3.5).close(), {
    fill: "#e9c99a",
    stroke: "#6b5310",
    lineWidth: 1,
  });
  const lead = new Path(new Shape().moveTo(-4.5, -1.3).lineTo(-7, 0).lineTo(-4.5, 1.3).close(), { fill: "#333" });
  return new Node({ children: [body, eraser, tip, lead], rotation: -Math.PI / 4 });
}

/** Static picture of the voltmeter for the toolbox. */
export function createVoltmeterIcon(options?: NodeOptions): Node {
  const { node } = createCrosshair();
  const body = createBody(new Rectangle(0, 0, BODY_WIDTH - 24, 22, 4, 4, { fill: "#ffffff", stroke: "#000000" }));
  return new Node({ children: [node, body], ...options });
}

/**
 * Draggable electric potential sensor. The crosshair ring is tinted with the voltage-map colour,
 * the readout shows V at the crosshair, and the buttons plot or erase equipotential lines.
 */
export class VoltmeterNode extends Node {
  public readonly dragListener: RichDragListener;
  /**
   * The focusable, draggable part (crosshair, body, readout). The buttons sit beside it rather than
   * inside it, so keys pressed on a focused button never start a keyboard drag of the voltmeter.
   */
  public readonly dragHandle: Node;

  public constructor(model: ExploreModel, mvt: ModelViewTransform2, onDrop: () => void) {
    const strings = StringManager.getInstance();
    const a11y = strings.getExploreA11yStrings();
    const ui = strings.getUiStrings();
    super();
    const dragHandle = new Node({
      cursor: "grab",
      tagName: "div",
      focusable: true,
      accessibleName: a11y.controls.voltmeterStringProperty,
      accessibleHelpText: a11y.controls.moveVoltmeterStringProperty,
    });
    this.dragHandle = dragHandle;

    const { node: crosshair, ring } = createCrosshair();
    const title = new Text(ui.voltmeterStringProperty, {
      font: "bold 13px sans-serif",
      fill: ElectricFieldMapperColors.voltmeterTitleColorProperty,
      maxWidth: BODY_WIDTH - 16,
    });
    const readout = new Text("", { font: "14px sans-serif", fill: "#000000", maxWidth: BODY_WIDTH - 32 });
    const readoutBackground = new Rectangle(0, 0, BODY_WIDTH - 24, 22, 4, 4, { fill: "#ffffff", stroke: "#000000" });
    const readoutBox = new Node({ children: [readoutBackground, readout] });
    const clearButton = new EraserButton({
      baseColor: BUTTON_BASE_COLOR,
      iconWidth: 20,
      accessibleName: a11y.controls.clearEquipotentialsStringProperty,
      listener: () => model.clearEquipotentials(),
    });
    const plotButton = new RectangularPushButton({
      baseColor: BUTTON_BASE_COLOR,
      content: createPencilIcon(),
      xMargin: 8,
      yMargin: 5,
      accessibleName: a11y.controls.plotEquipotentialStringProperty,
      listener: () => model.addEquipotentialAtVoltmeter(),
    });
    const buttons = new HBox({ spacing: 10, children: [clearButton, plotButton] });
    // Lay the body out around a placeholder, then put the real buttons over it as a sibling of the handle.
    const buttonSpace = new Rectangle(0, 0, buttons.width, buttons.height);
    const body = createBody(new VBox({ spacing: 6, children: [title, readoutBox, buttonSpace] }));
    buttons.translation = buttonSpace.localToGlobalPoint(Vector2.ZERO).minus(body.localToGlobalPoint(Vector2.ZERO));
    dragHandle.children = [crosshair, body];
    this.children = [dragHandle, buttons];

    const update = (): void => {
      const position = model.voltmeterPositionProperty.value;
      this.translation = mvt.modelToViewPosition(position);
      const potential = electricPotential(model.getSnapshot(), position);
      readout.string = `${formatSignificant(potential)} V`;
      readout.center = readoutBackground.center;
      ring.fill = potentialCSS(potential, 0.5);
      plotButton.enabled = model.charges.length > 0;
    };
    model.voltmeterPositionProperty.link(update);
    model.changeCountProperty.lazyLink(update);
    ElectricFieldMapperColors.playAreaColorProperty.lazyLink(update);
    ElectricFieldMapperColors.potentialPositiveColorProperty.lazyLink(update);
    ElectricFieldMapperColors.potentialNegativeColorProperty.lazyLink(update);

    this.dragListener = new RichDragListener({
      positionProperty: model.voltmeterPositionProperty,
      transform: mvt,
      // Grabbing the body keeps the crosshair offset rather than snapping it to the pointer. The offset
      // is measured on this whole node, which carries the translation, not on the inner handle.
      dragListenerOptions: { targetNode: this },
      keyboardDragListenerOptions: {
        dragSpeed: 90,
        shiftDragSpeed: 30,
        dragBoundsProperty: model.keyboardDragBoundsProperty,
      },
      end: (event) => {
        if (event) {
          onDrop();
        }
      },
    });
    dragHandle.addInputListener(this.dragListener);
    // Announce the reading once released; changing PDOM content mid-drag would interrupt a keyboard drag.
    this.dragListener.isPressedProperty.lazyLink((pressed) => {
      if (!pressed) {
        dragHandle.addAccessibleObjectResponse(`${ui.potentialStringProperty.value} ${readout.string}`);
      }
    });
    dragHandle.addInputListener(
      new KeyboardListener({
        keys: ["delete", "backspace"],
        fire: () => {
          model.voltmeterActiveProperty.value = false;
        },
      }),
    );
    model.voltmeterActiveProperty.link((active) => {
      // Putting the voltmeter away mid-drag (Delete, toolbox, reset) must end that drag cleanly.
      if (!active) {
        this.interruptSubtreeInput();
      }
      this.visible = active;
    });
  }
}
