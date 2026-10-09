import type { Bounds2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { CanvasNode } from "scenerystack/scenery";
import ElectricFieldMapperColors from "../../ElectricFieldMapperColors.js";
import { GRID_SPACING_M } from "../../ElectricFieldMapperConstants.js";
import type { ExploreModel } from "../model/ExploreModel.js";
import { FIELD_BOUNDS } from "../model/ExploreModel.js";
import {
  automaticFieldLines,
  electricField,
  electricPotential,
  type Point,
  traceEquipotential,
  traceFieldLine,
} from "../model/FieldPhysics.js";
import { formatSignificant } from "./formatReadout.js";
import { potentialRGB } from "./potentialColor.js";

type Charges = ReturnType<ExploreModel["getSnapshot"]>;

/** Model metres per voltage-map cell; the coarse image is smoothed when scaled up. */
const VOLTAGE_CELL = 0.05;

/** Draws the voltage map, grid, equipotentials, vector samples, and continuous electric field lines. */
export class FieldCanvasNode extends CanvasNode {
  private readonly repaint = (): void => this.invalidatePaint();
  private readonly model: ExploreModel;
  private readonly mvt: ModelViewTransform2;
  private voltageCanvas: HTMLCanvasElement | null = null;
  public constructor(model: ExploreModel, mvt: ModelViewTransform2, canvasBounds: Bounds2) {
    super({ canvasBounds });
    this.model = model;
    this.mvt = mvt;
    model.changeCountProperty.link(this.repaint);
    model.showVectorsProperty.link(this.repaint);
    model.showLinesProperty.link(this.repaint);
    model.showGridProperty.link(this.repaint);
    model.automaticLinesProperty.link(this.repaint);
    model.denseFieldLinesProperty.link(this.repaint);
    ElectricFieldMapperColors.gridColorProperty.link(this.repaint);
    ElectricFieldMapperColors.fieldArrowColorProperty.link(this.repaint);
    ElectricFieldMapperColors.fieldLineColorProperty.link(this.repaint);
    model.showVoltageProperty.link(this.repaint);
    ElectricFieldMapperColors.playAreaColorProperty.link(this.repaint);
    ElectricFieldMapperColors.potentialPositiveColorProperty.link(this.repaint);
    ElectricFieldMapperColors.potentialNegativeColorProperty.link(this.repaint);
    ElectricFieldMapperColors.equipotentialLineColorProperty.link(this.repaint);
  }

  public override paintCanvas(ctx: CanvasRenderingContext2D): void {
    const charges = this.model.getSnapshot();
    const mvt = this.mvt;
    const left = mvt.modelToViewX(FIELD_BOUNDS.minX);
    const right = mvt.modelToViewX(FIELD_BOUNDS.maxX);
    const top = mvt.modelToViewY(FIELD_BOUNDS.minY);
    const bottom = mvt.modelToViewY(FIELD_BOUNDS.maxY);
    ctx.save();
    ctx.beginPath();
    ctx.rect(left, top, right - left, bottom - top);
    ctx.clip();

    if (this.model.showVoltageProperty.value) {
      this.drawVoltageMap(ctx, charges, left, right, top, bottom);
    }

    if (this.model.showGridProperty.value) {
      this.drawGrid(ctx, left, right, top, bottom);
    }

    if (this.model.showLinesProperty.value && charges.length > 0) {
      this.drawFieldLines(ctx, charges);
    }

    if (this.model.equipotentialSeeds.length > 0 && charges.length > 0) {
      this.drawEquipotentials(ctx, charges);
    }

    if (this.model.showVectorsProperty.value) {
      this.drawVectors(ctx, charges);
    }
    ctx.restore();
  }

  private drawFieldLines(ctx: CanvasRenderingContext2D, charges: Charges): void {
    const lines = this.model.automaticLinesProperty.value
      ? automaticFieldLines(charges, FIELD_BOUNDS, this.model.denseFieldLinesProperty.value ? 20 : 12)
      : [];
    for (const seed of this.model.seedPoints) {
      lines.push(traceFieldLine(charges, seed, FIELD_BOUNDS));
    }
    ctx.strokeStyle = ElectricFieldMapperColors.fieldLineColorProperty.value.toCSS();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 1.8;
    for (const line of lines) {
      this.drawLine(ctx, line);
    }
  }

  private drawVectors(ctx: CanvasRenderingContext2D, charges: Charges): void {
    const mvt = this.mvt;
    ctx.strokeStyle = ElectricFieldMapperColors.fieldArrowColorProperty.value.toCSS();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = 1.6;
    for (let y = FIELD_BOUNDS.minY + 0.25; y < FIELD_BOUNDS.maxY; y += 0.5) {
      for (let x = FIELD_BOUNDS.minX + 0.25; x < FIELD_BOUNDS.maxX; x += 0.5) {
        const e = electricField(charges, { x, y });
        const magnitude = Math.hypot(e.x, e.y);
        if (!Number.isFinite(magnitude) || magnitude < 0.05) {
          continue;
        }
        const opacity = Math.min(0.95, Math.max(0.2, Math.log1p(magnitude) / 4));
        ctx.globalAlpha = opacity;
        const length = 4 + 12 * Math.min(1, Math.log1p(magnitude) / 4);
        this.arrow(ctx, mvt.modelToViewX(x), mvt.modelToViewY(y), e.x / magnitude, e.y / magnitude, length);
      }
    }
    ctx.globalAlpha = 1;
  }

  private drawVoltageMap(
    ctx: CanvasRenderingContext2D,
    charges: Charges,
    left: number,
    right: number,
    top: number,
    bottom: number,
  ): void {
    const columns = Math.round((FIELD_BOUNDS.maxX - FIELD_BOUNDS.minX) / VOLTAGE_CELL);
    const rows = Math.round((FIELD_BOUNDS.maxY - FIELD_BOUNDS.minY) / VOLTAGE_CELL);
    if (!this.voltageCanvas) {
      this.voltageCanvas = document.createElement("canvas");
      this.voltageCanvas.width = columns;
      this.voltageCanvas.height = rows;
    }
    const voltageContext = this.voltageCanvas.getContext("2d");
    if (!voltageContext) {
      return;
    }
    const image = voltageContext.createImageData(columns, rows);
    const zero = ElectricFieldMapperColors.playAreaColorProperty.value;
    const positive = ElectricFieldMapperColors.potentialPositiveColorProperty.value;
    const negative = ElectricFieldMapperColors.potentialNegativeColorProperty.value;
    for (let row = 0; row < rows; row++) {
      // The board transform does not flip y, so image rows and model y both run downward.
      const y = FIELD_BOUNDS.minY + (row + 0.5) * VOLTAGE_CELL;
      for (let column = 0; column < columns; column++) {
        const x = FIELD_BOUNDS.minX + (column + 0.5) * VOLTAGE_CELL;
        const [r, g, b] = potentialRGB(electricPotential(charges, { x, y }), zero, positive, negative);
        const offset = 4 * (row * columns + column);
        image.data[offset] = r;
        image.data[offset + 1] = g;
        image.data[offset + 2] = b;
        image.data[offset + 3] = 255;
      }
    }
    voltageContext.putImageData(image, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.voltageCanvas, left, top, right - left, bottom - top);
  }

  private drawEquipotentials(ctx: CanvasRenderingContext2D, charges: Charges): void {
    const color = ElectricFieldMapperColors.equipotentialLineColorProperty.value.toCSS();
    ctx.lineWidth = 1.8;
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const seed of this.model.equipotentialSeeds) {
      const line = traceEquipotential(charges, seed, FIELD_BOUNDS);
      if (line.length < 2) {
        continue;
      }
      ctx.strokeStyle = color;
      ctx.beginPath();
      line.forEach((p, i) => {
        const px = this.mvt.modelToViewX(p.x);
        const py = this.mvt.modelToViewY(p.y);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      });
      ctx.stroke();
      // Label each line with its voltage at the point where it was plotted.
      const label = `${formatSignificant(electricPotential(charges, seed))} V`;
      const px = this.mvt.modelToViewX(seed.x);
      const py = this.mvt.modelToViewY(seed.y);
      const width = ctx.measureText(label).width + 8;
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(px - width / 2, py - 9, width, 18);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, px, py);
    }
  }

  private drawGrid(ctx: CanvasRenderingContext2D, left: number, right: number, top: number, bottom: number): void {
    ctx.strokeStyle = ElectricFieldMapperColors.gridColorProperty.value.toCSS();
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = 1;
    for (let x = FIELD_BOUNDS.minX; x <= FIELD_BOUNDS.maxX; x += GRID_SPACING_M) {
      const px = this.mvt.modelToViewX(x);
      ctx.beginPath();
      ctx.moveTo(px, top);
      ctx.lineTo(px, bottom);
      ctx.stroke();
    }
    for (let y = FIELD_BOUNDS.minY; y <= FIELD_BOUNDS.maxY; y += GRID_SPACING_M) {
      const py = this.mvt.modelToViewY(y);
      ctx.beginPath();
      ctx.moveTo(left, py);
      ctx.lineTo(right, py);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  private drawLine(ctx: CanvasRenderingContext2D, line: Point[]): void {
    if (line.length < 2) {
      return;
    }
    const first = line[0];
    if (!first) {
      return;
    }
    ctx.beginPath();
    ctx.moveTo(this.mvt.modelToViewX(first.x), this.mvt.modelToViewY(first.y));
    let accumulated = 0;
    for (let i = 1; i < line.length; i++) {
      const a = line[i - 1];
      const b = line[i];
      if (!(a && b)) {
        continue;
      }
      const segment = Math.hypot(b.x - a.x, b.y - a.y);
      ctx.lineTo(this.mvt.modelToViewX(b.x), this.mvt.modelToViewY(b.y));
      accumulated += segment;
      if (accumulated >= 0.65 && segment > 0) {
        ctx.stroke();
        const px = this.mvt.modelToViewX(b.x);
        const py = this.mvt.modelToViewY(b.y);
        this.arrowHead(ctx, px, py, (b.x - a.x) / segment, (b.y - a.y) / segment, 7);
        ctx.beginPath();
        ctx.moveTo(px, py);
        accumulated = 0;
      }
    }
    ctx.stroke();
  }

  private arrow(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, length: number): void {
    ctx.beginPath();
    ctx.moveTo(x - dx * length * 0.45, y - dy * length * 0.45);
    ctx.lineTo(x + dx * length * 0.55, y + dy * length * 0.55);
    ctx.stroke();
    this.arrowHead(ctx, x + dx * length * 0.55, y + dy * length * 0.55, dx, dy, 5);
  }

  private arrowHead(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, size: number): void {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - dx * size - dy * size * 0.55, y - dy * size + dx * size * 0.55);
    ctx.lineTo(x - dx * size + dy * size * 0.55, y - dy * size - dx * size * 0.55);
    ctx.closePath();
    ctx.fill();
  }

  public override dispose(): void {
    this.model.changeCountProperty.unlink(this.repaint);
    this.model.showVectorsProperty.unlink(this.repaint);
    this.model.showLinesProperty.unlink(this.repaint);
    this.model.showGridProperty.unlink(this.repaint);
    this.model.automaticLinesProperty.unlink(this.repaint);
    this.model.denseFieldLinesProperty.unlink(this.repaint);
    ElectricFieldMapperColors.gridColorProperty.unlink(this.repaint);
    ElectricFieldMapperColors.fieldArrowColorProperty.unlink(this.repaint);
    ElectricFieldMapperColors.fieldLineColorProperty.unlink(this.repaint);
    this.model.showVoltageProperty.unlink(this.repaint);
    ElectricFieldMapperColors.playAreaColorProperty.unlink(this.repaint);
    ElectricFieldMapperColors.potentialPositiveColorProperty.unlink(this.repaint);
    ElectricFieldMapperColors.potentialNegativeColorProperty.unlink(this.repaint);
    ElectricFieldMapperColors.equipotentialLineColorProperty.unlink(this.repaint);
    super.dispose();
  }
}
