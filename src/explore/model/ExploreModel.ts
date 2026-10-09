import { BooleanProperty, createObservableArray, NumberProperty, type ObservableArray } from "scenerystack/axon";
import { Vector2, Vector2Property } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { CHARGE_RADIUS, type FieldBounds, type Point } from "./FieldPhysics.js";

export const FIELD_BOUNDS: FieldBounds = { minX: -4, maxX: 4, minY: -3, maxY: 3 };

export class PointCharge {
  public readonly positionProperty: Vector2Property;
  public readonly q: 1 | -1;
  public constructor(q: 1 | -1, position: Point) {
    this.q = q;
    this.positionProperty = new Vector2Property(new Vector2(position.x, position.y));
  }
  public dispose(): void {
    this.positionProperty.dispose();
  }
}

export class ExploreModel implements TModel {
  public readonly charges: ObservableArray<PointCharge> = createObservableArray<PointCharge>();
  public readonly changeCountProperty = new NumberProperty(0);
  public readonly showVectorsProperty = new BooleanProperty(true);
  public readonly showLinesProperty = new BooleanProperty(true);
  public readonly showGridProperty = new BooleanProperty(true);
  public readonly drawModeProperty = new BooleanProperty(false);
  public readonly denseFieldLinesProperty: BooleanProperty;
  public readonly automaticLinesProperty = new BooleanProperty(true);
  public readonly probePositionProperty = new Vector2Property(new Vector2(0, 1.55));
  public readonly seedPoints: Point[] = [];

  public constructor(denseFieldLinesProperty = new BooleanProperty(false)) {
    this.denseFieldLinesProperty = denseFieldLinesProperty;
    this.addCharge(1, { x: -1.45, y: 0 });
    this.addCharge(-1, { x: 1.45, y: 0 });
  }

  public notifyChanged(): void {
    this.changeCountProperty.value++;
  }

  public addCharge(q: 1 | -1, point: Point): PointCharge {
    const charge = new PointCharge(q, point);
    this.charges.push(charge);
    this.notifyChanged();
    return charge;
  }

  public removeCharge(charge: PointCharge): void {
    this.charges.remove(charge);
    charge.dispose();
    this.notifyChanged();
  }

  public addSeed(point: Point): void {
    if (this.charges.length === 0) {
      return;
    }
    this.seedPoints.push(point);
    this.notifyChanged();
  }

  public clearSeeds(): void {
    this.seedPoints.length = 0;
    this.notifyChanged();
  }

  public reset(): void {
    for (const charge of [...this.charges]) {
      this.removeCharge(charge);
    }
    this.seedPoints.length = 0;
    this.addCharge(1, { x: -1.45, y: 0 });
    this.addCharge(-1, { x: 1.45, y: 0 });
    this.showVectorsProperty.reset();
    this.showLinesProperty.reset();
    this.showGridProperty.reset();
    this.drawModeProperty.reset();
    this.automaticLinesProperty.reset();
    this.probePositionProperty.reset();
    this.notifyChanged();
  }

  public getSnapshot() {
    return this.charges
      .filter((charge) => {
        const p = charge.positionProperty.value;
        return (
          p.x >= FIELD_BOUNDS.minX && p.x <= FIELD_BOUNDS.maxX && p.y >= FIELD_BOUNDS.minY && p.y <= FIELD_BOUNDS.maxY
        );
      })
      .map((charge) => ({
        q: charge.q,
        x: charge.positionProperty.value.x,
        y: charge.positionProperty.value.y,
      }));
  }
  public isNearCharge(point: Point): boolean {
    return this.charges.some(
      (charge) =>
        Math.hypot(point.x - charge.positionProperty.value.x, point.y - charge.positionProperty.value.y) <
        CHARGE_RADIUS * 1.3,
    );
  }
  public step(_dt: number): void {
    /* Static electrostatics. */
  }
}
