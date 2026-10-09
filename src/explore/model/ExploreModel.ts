import {
  BooleanProperty,
  createObservableArray,
  NumberProperty,
  type ObservableArray,
  Property,
} from "scenerystack/axon";
import { Vector2, Vector2Property } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { GRID_SPACING_M } from "../../ElectricFieldMapperConstants.js";
import { CHARGE_PRESETS, type ChargePreset } from "./ChargePresets.js";
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
  public readonly snapToGridProperty = new BooleanProperty(false);
  public readonly presetProperty = new Property<ChargePreset>("dipole");
  public readonly drawModeProperty = new BooleanProperty(false);
  public readonly denseFieldLinesProperty: BooleanProperty;
  public readonly automaticLinesProperty = new BooleanProperty(true);
  public readonly probePositionProperty = new Vector2Property(new Vector2(0, 1.55));
  public readonly seedPoints: Point[] = [];
  private readonly chargePositionListeners = new Map<PointCharge, () => void>();
  private applyingPreset = false;

  public constructor(denseFieldLinesProperty = new BooleanProperty(false)) {
    this.denseFieldLinesProperty = denseFieldLinesProperty;
    this.presetProperty.link((preset) => {
      if (preset !== "custom" && !this.applyingPreset) {
        this.applyPreset(preset);
      }
    });
    this.snapToGridProperty.lazyLink((snap) => {
      if (snap) {
        for (const charge of this.charges) {
          const position = charge.positionProperty.value;
          const snapped = this.snapPosition(position);
          if (snapped.x !== position.x || snapped.y !== position.y) {
            charge.positionProperty.value = snapped;
          }
        }
      }
    });
  }

  public notifyChanged(): void {
    this.changeCountProperty.value++;
  }

  public addCharge(q: 1 | -1, point: Point): PointCharge {
    const charge = new PointCharge(q, this.snapToGridProperty.value ? this.snapPosition(point) : point);
    const onMove = () => {
      if (!this.applyingPreset) {
        this.presetProperty.value = "custom";
      }
    };
    charge.positionProperty.lazyLink(onMove);
    this.chargePositionListeners.set(charge, onMove);
    this.charges.push(charge);
    if (!this.applyingPreset) {
      this.presetProperty.value = "custom";
    }
    this.notifyChanged();
    return charge;
  }

  public removeCharge(charge: PointCharge): void {
    const onMove = this.chargePositionListeners.get(charge);
    if (onMove) {
      charge.positionProperty.unlink(onMove);
      this.chargePositionListeners.delete(charge);
    }
    this.charges.remove(charge);
    charge.dispose();
    if (!this.applyingPreset) {
      this.presetProperty.value = "custom";
    }
    this.notifyChanged();
  }

  public snapPosition(point: Point): Vector2 {
    const snap = (value: number, min: number, max: number) => {
      const rounded = Math.round(value / GRID_SPACING_M) * GRID_SPACING_M;
      return value >= min && value <= max
        ? Math.max(min + GRID_SPACING_M, Math.min(max - GRID_SPACING_M, rounded))
        : rounded;
    };
    return new Vector2(
      snap(point.x, FIELD_BOUNDS.minX, FIELD_BOUNDS.maxX),
      snap(point.y, FIELD_BOUNDS.minY, FIELD_BOUNDS.maxY),
    );
  }

  /** Replace charges with a named example. Drawn lines are cleared because their seeds refer to the old arrangement. */
  public applyPreset(preset: Exclude<ChargePreset, "custom">): void {
    this.applyingPreset = true;
    try {
      for (const charge of [...this.charges]) {
        this.removeCharge(charge);
      }
      this.seedPoints.length = 0;
      for (const charge of CHARGE_PRESETS[preset]) {
        this.addCharge(charge.q, charge);
      }
      this.presetProperty.value = preset;
    } finally {
      this.applyingPreset = false;
    }
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
    this.applyPreset("dipole");
    this.showVectorsProperty.reset();
    this.showLinesProperty.reset();
    this.showGridProperty.reset();
    this.snapToGridProperty.reset();
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
