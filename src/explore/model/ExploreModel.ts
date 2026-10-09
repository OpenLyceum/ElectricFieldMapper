import {
  BooleanProperty,
  createObservableArray,
  NumberProperty,
  type ObservableArray,
  Property,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Bounds2, Vector2, Vector2Property } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { CHARGE_RADIUS, type FieldBounds, type Point } from "./FieldPhysics.js";

export const FIELD_BOUNDS: FieldBounds = { minX: -4, maxX: 4, minY: -3, maxY: 3 };

/**
 * Keyboard drags stay on the board (keyboard users remove items with Delete), so a keyboard drag
 * never needs clamping when it ends. Pointer drags may leave the board to reach the toolboxes.
 */
export const KEYBOARD_DRAG_BOUNDS_PROPERTY: TReadOnlyProperty<Bounds2> = new Property(
  new Bounds2(FIELD_BOUNDS.minX + 0.18, FIELD_BOUNDS.minY + 0.18, FIELD_BOUNDS.maxX - 0.18, FIELD_BOUNDS.maxY - 0.18),
);

/** Model position where the voltmeter appears when placed from the keyboard. */
const VOLTMETER_DEFAULT_POSITION = new Vector2(0, 1.55);

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

/** A movable point that reports the electric field vector where it sits. */
export class ElectricFieldSensor {
  public readonly positionProperty: Vector2Property;
  public constructor(position: Point) {
    this.positionProperty = new Vector2Property(new Vector2(position.x, position.y));
  }
  public dispose(): void {
    this.positionProperty.dispose();
  }
}

export class ExploreModel implements TModel {
  public readonly charges: ObservableArray<PointCharge> = createObservableArray<PointCharge>();
  public readonly sensors: ObservableArray<ElectricFieldSensor> = createObservableArray<ElectricFieldSensor>();
  public readonly changeCountProperty = new NumberProperty(0);
  public readonly showVectorsProperty = new BooleanProperty(true);
  public readonly showLinesProperty = new BooleanProperty(true);
  public readonly showVoltageProperty = new BooleanProperty(false);
  public readonly showGridProperty = new BooleanProperty(true);
  public readonly drawModeProperty = new BooleanProperty(false);
  public readonly denseFieldLinesProperty: BooleanProperty;
  public readonly automaticLinesProperty = new BooleanProperty(true);
  /** True while the voltmeter is out of its toolbox and on the board. */
  public readonly voltmeterActiveProperty = new BooleanProperty(false);
  public readonly voltmeterPositionProperty = new Vector2Property(VOLTMETER_DEFAULT_POSITION);
  public readonly seedPoints: Point[] = [];
  public readonly equipotentialSeeds: Point[] = [];

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

  public addSensor(point: Point): ElectricFieldSensor {
    const sensor = new ElectricFieldSensor(point);
    this.sensors.push(sensor);
    return sensor;
  }

  public removeSensor(sensor: ElectricFieldSensor): void {
    this.sensors.remove(sensor);
    sensor.dispose();
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

  /** Records an equipotential through the voltmeter crosshair, outside charge disks. */
  public addEquipotentialAtVoltmeter(): void {
    const p = this.voltmeterPositionProperty.value;
    if (this.charges.length === 0 || this.isNearCharge(p)) {
      return;
    }
    this.equipotentialSeeds.push({ x: p.x, y: p.y });
    this.notifyChanged();
  }

  public clearEquipotentials(): void {
    this.equipotentialSeeds.length = 0;
    this.notifyChanged();
  }

  public reset(): void {
    for (const charge of [...this.charges]) {
      this.removeCharge(charge);
    }
    for (const sensor of [...this.sensors]) {
      this.removeSensor(sensor);
    }
    this.seedPoints.length = 0;
    this.equipotentialSeeds.length = 0;
    this.addCharge(1, { x: -1.45, y: 0 });
    this.addCharge(-1, { x: 1.45, y: 0 });
    this.showVectorsProperty.reset();
    this.showLinesProperty.reset();
    this.showVoltageProperty.reset();
    this.showGridProperty.reset();
    this.drawModeProperty.reset();
    this.automaticLinesProperty.reset();
    this.voltmeterActiveProperty.reset();
    this.voltmeterPositionProperty.reset();
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
