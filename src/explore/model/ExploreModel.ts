import {
  BooleanProperty,
  createObservableArray,
  DerivedProperty,
  NumberProperty,
  type ObservableArray,
  Property,
  type TReadOnlyProperty,
} from "scenerystack/axon";
import { Bounds2, Vector2, Vector2Property } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { GRID_MINOR_LINES_PER_MAJOR, GRID_SPACING_M } from "../../ElectricFieldMapperConstants.js";
import { CHARGE_PRESETS, type ChargePreset } from "./ChargePresets.js";
import { CHARGE_RADIUS, combineCoincidentCharges, type FieldBounds, type Point } from "./FieldPhysics.js";

/** Initial field area, before the view reports how much of the model the browser window shows. */
export const FIELD_BOUNDS: FieldBounds = { minX: -4, maxX: 4, minY: -3, maxY: 3 };

/** The field never extends past these bounds, however wide or tall the window becomes (metres). */
export const ENLARGED_FIELD_BOUNDS = new Bounds2(-16, -12, 16, 12);

/** Distance keyboard drags keep from the edge of the field (metres). */
const KEYBOARD_DRAG_MARGIN = 0.18;

/** Model position where the voltmeter appears when placed from the keyboard. */
const VOLTMETER_DEFAULT_POSITION = new Vector2(0, 1.55);

/** Measuring tape when placed from the keyboard: one major grid square, clear of the dipole. */
const MEASURING_TAPE_BASE = new Vector2(0, 1.2);
const MEASURING_TAPE_TIP = new Vector2(GRID_SPACING_M, 1.2);

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
  /**
   * Numeric labels on field sensors (strength and angle) and on equipotential curves,
   * and the one-metre scale arrow on the grid. Off by default, as in Charges and Fields.
   * The voltmeter and measuring-tape readouts stay visible either way.
   */
  public readonly showValuesProperty = new BooleanProperty(false);
  public readonly showGridProperty = new BooleanProperty(true);
  public readonly snapToGridProperty = new BooleanProperty(false);
  public readonly presetProperty = new Property<ChargePreset>("dipole");
  public readonly drawModeProperty = new BooleanProperty(false);
  public readonly denseFieldLinesProperty: BooleanProperty;
  public readonly automaticLinesProperty = new BooleanProperty(true);
  /** True while the voltmeter is out of its toolbox and on the board. */
  public readonly voltmeterActiveProperty = new BooleanProperty(false);
  public readonly voltmeterPositionProperty = new Vector2Property(VOLTMETER_DEFAULT_POSITION);
  /** True while the measuring tape is out of its toolbox and on the board. */
  public readonly measuringTapeActiveProperty = new BooleanProperty(false);
  public readonly measuringTapeBasePositionProperty = new Vector2Property(MEASURING_TAPE_BASE);
  public readonly measuringTapeTipPositionProperty = new Vector2Property(MEASURING_TAPE_TIP);
  public readonly seedPoints: Point[] = [];
  public readonly equipotentialSeeds: Point[] = [];
  /** The visible part of the field (model metres); the view updates it as the window resizes. */
  public readonly fieldBoundsProperty = new Property<Bounds2>(
    new Bounds2(FIELD_BOUNDS.minX, FIELD_BOUNDS.minY, FIELD_BOUNDS.maxX, FIELD_BOUNDS.maxY),
  );
  /**
   * Keyboard drags stay on the field (keyboard users remove items with Delete), so a keyboard drag
   * never needs clamping when it ends. Pointer drags may leave the field to reach the toolboxes.
   */
  public readonly keyboardDragBoundsProperty: TReadOnlyProperty<Bounds2> = new DerivedProperty(
    [this.fieldBoundsProperty],
    (bounds) => bounds.eroded(KEYBOARD_DRAG_MARGIN),
  );
  private readonly chargePositionListeners = new Map<PointCharge, () => void>();
  /** True while charges move for a reason other than the user editing them, so the preset is kept. */
  private movingProgrammatically = false;

  public constructor(denseFieldLinesProperty = new BooleanProperty(false)) {
    this.denseFieldLinesProperty = denseFieldLinesProperty;
    this.presetProperty.link((preset) => {
      if (preset !== "custom" && !this.movingProgrammatically) {
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
        this.snapMeasuringTape();
      }
    });
  }

  public notifyChanged(): void {
    this.changeCountProperty.value++;
  }

  public addCharge(q: 1 | -1, point: Point): PointCharge {
    const charge = new PointCharge(q, this.snapToGridProperty.value ? this.snapPosition(point) : point);
    const onMove = () => {
      if (!this.movingProgrammatically) {
        this.presetProperty.value = "custom";
      }
    };
    charge.positionProperty.lazyLink(onMove);
    this.chargePositionListeners.set(charge, onMove);
    this.charges.push(charge);
    if (!this.movingProgrammatically) {
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
    if (!this.movingProgrammatically) {
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
    const bounds = this.fieldBoundsProperty.value;
    return new Vector2(snap(point.x, bounds.minX, bounds.maxX), snap(point.y, bounds.minY, bounds.maxY));
  }

  /** Brings items back into view after the field shrinks, without counting as a user edit. */
  public keepItemsInField(): void {
    const bounds = this.fieldBoundsProperty.value.eroded(KEYBOARD_DRAG_MARGIN);
    if (!bounds.isValid()) {
      return;
    }
    const constrain = (property: Vector2Property): void => {
      if (!bounds.containsPoint(property.value)) {
        property.value = bounds.closestPointTo(property.value);
      }
    };
    this.movingProgrammatically = true;
    try {
      for (const charge of this.charges) {
        constrain(charge.positionProperty);
      }
    } finally {
      this.movingProgrammatically = false;
    }
    for (const sensor of this.sensors) {
      constrain(sensor.positionProperty);
    }
    constrain(this.voltmeterPositionProperty);
    constrain(this.measuringTapeBasePositionProperty);
    constrain(this.measuringTapeTipPositionProperty);
  }

  /**
   * Snaps the measuring tape to minor grid lines, as Charges and Fields does when Snap to Grid is on
   * and the grid is visible.
   */
  public snapMeasuringTape(end: "both" | "tip" = "both"): void {
    if (!(this.snapToGridProperty.value && this.showGridProperty.value)) {
      return;
    }
    if (end === "both") {
      this.snapTapeEnd(this.measuringTapeBasePositionProperty);
    }
    this.snapTapeEnd(this.measuringTapeTipPositionProperty);
  }

  private snapTapeEnd(positionProperty: Vector2Property): void {
    const snapped = this.snapToMinorGrid(positionProperty.value);
    if (!snapped.equals(positionProperty.value)) {
      positionProperty.value = snapped;
    }
  }

  private snapToMinorGrid(point: Point): Vector2 {
    const spacing = GRID_SPACING_M / GRID_MINOR_LINES_PER_MAJOR;
    const bounds = this.fieldBoundsProperty.value;
    const snap = (value: number, min: number, max: number): number => {
      const rounded = Math.round(Math.round(value / spacing) * spacing * 1e6) / 1e6;
      return Math.max(min, Math.min(max, rounded));
    };
    return new Vector2(snap(point.x, bounds.minX, bounds.maxX), snap(point.y, bounds.minY, bounds.maxY));
  }

  /** Replace charges with a named example. Drawn lines are cleared because their seeds refer to the old arrangement. */
  public applyPreset(preset: Exclude<ChargePreset, "custom">): void {
    this.movingProgrammatically = true;
    try {
      for (const charge of [...this.charges]) {
        this.removeCharge(charge);
      }
      this.seedPoints.length = 0;
      this.equipotentialSeeds.length = 0;
      for (const charge of CHARGE_PRESETS[preset]) {
        this.addCharge(charge.q, charge);
      }
      this.presetProperty.value = preset;
    } finally {
      this.movingProgrammatically = false;
    }
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
    this.applyPreset("dipole");
    for (const sensor of [...this.sensors]) {
      this.removeSensor(sensor);
    }
    this.showVectorsProperty.reset();
    this.showLinesProperty.reset();
    this.showVoltageProperty.reset();
    this.showValuesProperty.reset();
    this.showGridProperty.reset();
    this.snapToGridProperty.reset();
    this.drawModeProperty.reset();
    this.automaticLinesProperty.reset();
    this.voltmeterActiveProperty.reset();
    this.voltmeterPositionProperty.reset();
    this.measuringTapeActiveProperty.reset();
    this.measuringTapeBasePositionProperty.reset();
    this.measuringTapeTipPositionProperty.reset();
    this.notifyChanged();
  }

  /** Net field sources; the individual draggable charges remain in the model. */
  public getSnapshot() {
    return combineCoincidentCharges(
      this.charges
        .filter((charge) => this.fieldBoundsProperty.value.containsPoint(charge.positionProperty.value))
        .map((charge) => ({
          q: charge.q,
          x: charge.positionProperty.value.x,
          y: charge.positionProperty.value.y,
        })),
    );
  }
  public isNearCharge(point: Point): boolean {
    return this.getSnapshot().some(
      (charge) => Math.hypot(point.x - charge.x, point.y - charge.y) < CHARGE_RADIUS * 1.3,
    );
  }
  public step(_dt: number): void {
    /* Static electrostatics. */
  }
}
