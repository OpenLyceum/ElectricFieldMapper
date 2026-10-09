import type { Bounds2 } from "scenerystack/dot";
import type { ModelViewTransform2 } from "scenerystack/phetcommon";
import { CanvasNode } from "scenerystack/scenery";
import ElectricFieldMapperColors from "../../ElectricFieldMapperColors.js";
import { GRID_SPACING_M } from "../../ElectricFieldMapperConstants.js";
import type { ExploreModel } from "../model/ExploreModel.js";
import { FIELD_BOUNDS } from "../model/ExploreModel.js";
import { automaticFieldLines, electricField, type Point, traceFieldLine } from "../model/FieldPhysics.js";

/** Draws the grid, vector samples, and continuous electric field lines. */
export class FieldCanvasNode extends CanvasNode {
  private readonly repaint = (): void => this.invalidatePaint();
  private readonly model: ExploreModel;
  private readonly mvt: ModelViewTransform2;
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

    if (this.model.showGridProperty.value) {
      this.drawGrid(ctx, left, right, top, bottom);
    }

    if (this.model.showLinesProperty.value && charges.length > 0) {
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

    if (this.model.showVectorsProperty.value) {
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
    ctx.restore();
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
    super.dispose();
  }
}
