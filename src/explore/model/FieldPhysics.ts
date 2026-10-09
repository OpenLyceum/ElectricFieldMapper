import type { VoltageScale } from "./FieldDisplayOptions.js";

/** Coulomb field and adaptive field-line tracing. Coordinates are metres, charges nC. */
export type Point = { x: number; y: number };
export type Charge = Point & { q: number };
export type FieldBounds = { minX: number; maxX: number; minY: number; maxY: number };

export const K_NC = 8.9875517923; // (N m²/C²) × 1 nC, yielding V/m at 1 m.
export const CHARGE_RADIUS = 0.15; // m, visible disk and singularity cutoff.
const FIELD_NULL_STOP_SCALE = 0.002; // m, below a screen pixel at the standard board scale.
const FIELD_NULL_STEP_FRACTION = 0.45;

/** Sum charges at exactly the same position before applying singularity cutoffs or seeding lines. */
export function combineCoincidentCharges(charges: readonly Charge[]): readonly Charge[] {
  // Sampling and RK4 usually receive distinct sources; keep that path allocation-free.
  const needsCombining = charges.some(
    (charge, index) =>
      charge.q === 0 ||
      charges.some((other, otherIndex) => otherIndex < index && other.x === charge.x && other.y === charge.y),
  );
  if (!needsCombining) {
    return charges;
  }
  const combined: Charge[] = [];
  for (const charge of charges) {
    const existing = combined.find((other) => other.x === charge.x && other.y === charge.y);
    if (existing) {
      existing.q += charge.q;
    } else {
      combined.push({ ...charge });
    }
  }
  return combined.filter((charge) => charge.q !== 0);
}

export function electricField(charges: readonly Charge[], p: Point): Point {
  return electricFieldFromCharges(combineCoincidentCharges(charges), p);
}

function electricFieldFromCharges(charges: readonly Charge[], p: Point): Point {
  let x = 0;
  let y = 0;
  for (const charge of charges) {
    const dx = p.x - charge.x;
    const dy = p.y - charge.y;
    const r2 = dx * dx + dy * dy;
    // The field at a point charge is undefined. Callers can render no arrow there.
    if (r2 < CHARGE_RADIUS * CHARGE_RADIUS) {
      return { x: Number.NaN, y: Number.NaN };
    }
    const scale = (K_NC * charge.q) / (r2 * Math.sqrt(r2));
    x += dx * scale;
    y += dy * scale;
  }
  return { x, y };
}

export function electricPotential(charges: readonly Charge[], p: Point): number {
  return electricPotentialFromCharges(combineCoincidentCharges(charges), p);
}

function electricPotentialFromCharges(charges: readonly Charge[], p: Point): number {
  let potential = 0;
  for (const charge of charges) {
    const distance = Math.hypot(p.x - charge.x, p.y - charge.y);
    if (distance < CHARGE_RADIUS) {
      return charge.q > 0 ? Infinity : -Infinity;
    }
    potential += (K_NC * charge.q) / distance;
  }
  return potential;
}

function direction(charges: readonly Charge[], p: Point): Point | null {
  const field = electricFieldFromCharges(charges, p);
  const magnitude = Math.hypot(field.x, field.y);
  return Number.isFinite(magnitude) && magnitude > 1e-9 ? { x: field.x / magnitude, y: field.y / magnitude } : null;
}

/** Estimate how far the field is from a nearby zero using its local spatial derivative. */
function fieldVariationScale(charges: readonly Charge[], p: Point, magnitude: number): number {
  let xx = 0;
  let xy = 0;
  let yy = 0;
  for (const charge of charges) {
    const dx = p.x - charge.x;
    const dy = p.y - charge.y;
    const r2 = dx * dx + dy * dy;
    const scale = (K_NC * charge.q) / (r2 * r2 * Math.sqrt(r2));
    xx += scale * (r2 - 3 * dx * dx);
    xy -= scale * 3 * dx * dy;
    yy += scale * (r2 - 3 * dy * dy);
  }
  const gradient = Math.hypot(xx, xy, xy, yy);
  return gradient > 0 ? magnitude / gradient : Infinity;
}

function rk4(charges: readonly Charge[], p: Point, step: number): Point | null {
  const k1 = direction(charges, p);
  if (!k1) {
    return null;
  }
  const k2 = direction(charges, { x: p.x + (step * k1.x) / 2, y: p.y + (step * k1.y) / 2 });
  if (!k2) {
    return null;
  }
  const k3 = direction(charges, { x: p.x + (step * k2.x) / 2, y: p.y + (step * k2.y) / 2 });
  if (!k3) {
    return null;
  }
  const k4 = direction(charges, { x: p.x + step * k3.x, y: p.y + step * k3.y });
  if (!k4) {
    return null;
  }
  return {
    x: p.x + (step * (k1.x + 2 * k2.x + 2 * k3.x + k4.x)) / 6,
    y: p.y + (step * (k1.y + 2 * k2.y + 2 * k3.y + k4.y)) / 6,
  };
}

function traceOneWay(charges: readonly Charge[], seed: Point, bounds: FieldBounds, sign: 1 | -1): Point[] {
  const points: Point[] = [];
  let current = seed;
  let stepSize = 0.035;
  let previousDirection: Point | null = null;
  for (let i = 0; i < 900; i++) {
    if (current.x < bounds.minX || current.x > bounds.maxX || current.y < bounds.minY || current.y > bounds.maxY) {
      break;
    }
    let closest = Infinity;
    for (const charge of charges) {
      closest = Math.min(closest, Math.hypot(current.x - charge.x, current.y - charge.y));
    }
    if (closest <= CHARGE_RADIUS * 0.95) {
      break;
    }
    const field = electricFieldFromCharges(charges, current);
    const magnitude = Math.hypot(field.x, field.y);
    if (!(Number.isFinite(magnitude) && magnitude > 1e-9)) {
      break;
    }
    const tangent = { x: field.x / magnitude, y: field.y / magnitude };
    const variationScale = fieldVariationScale(charges, current, magnitude);
    // A normalized field has no direction at a zero. As a line approaches one,
    // shrink the step with the local field scale so RK4 never samples across it.
    if (variationScale < FIELD_NULL_STOP_SCALE) {
      break;
    }
    // Limit turning to roughly 5° per step, and prevent crossing a charge.
    if (previousDirection) {
      const dot = Math.max(-1, Math.min(1, tangent.x * previousDirection.x + tangent.y * previousDirection.y));
      const turn = Math.acos(dot);
      if (turn > 0.1) {
        stepSize = Math.max(0.012, stepSize * 0.6);
      } else if (turn < 0.025) {
        stepSize = Math.min(0.1, stepSize * 1.15);
      }
    }
    const next = rk4(
      charges,
      current,
      sign * Math.min(stepSize, closest * 0.38, variationScale * FIELD_NULL_STEP_FRACTION),
    );
    if (!(next && Number.isFinite(next.x + next.y)) || Math.hypot(next.x - current.x, next.y - current.y) < 1e-8) {
      break;
    }
    points.push(next);
    current = next;
    previousDirection = tangent;
  }
  return points;
}

/** Ordered in the direction of E, including the seed. */
export function traceFieldLine(charges: readonly Charge[], seed: Point, bounds: FieldBounds): Point[] {
  return traceFieldLineFromCharges(combineCoincidentCharges(charges), seed, bounds);
}

function traceFieldLineFromCharges(charges: readonly Charge[], seed: Point, bounds: FieldBounds): Point[] {
  if (charges.length === 0 || !direction(charges, seed)) {
    return [];
  }
  const backward = traceOneWay(charges, seed, bounds, -1).reverse();
  const forward = traceOneWay(charges, seed, bounds, 1);
  return [...backward, seed, ...forward];
}

function nearCharge(point: Point, charge: Charge): boolean {
  return Math.hypot(point.x - charge.x, point.y - charge.y) < 2 * CHARGE_RADIUS;
}

/** Trace enough lines that enter a sink from outside the board to fill its remaining count. */
function incomingLines(
  charges: readonly Charge[],
  sink: Charge,
  bounds: FieldBounds,
  lineCount: number,
  needed: number,
): Point[][] {
  const candidates: { angle: number; line: Point[] }[] = [];
  // The first pass keeps the familiar angles. Offset passes supply more edge lines when
  // unequal charges send a different fraction of their source lines into this sink.
  for (let pass = 0; pass < 4 && candidates.length < needed; pass++) {
    for (let i = 0; i < lineCount; i++) {
      const angle = (2 * Math.PI * (i + pass / 4)) / lineCount;
      const seed = { x: sink.x + 0.18 * Math.cos(angle), y: sink.y + 0.18 * Math.sin(angle) };
      const line = traceFieldLineFromCharges(charges, seed, bounds);
      const first = line[0];
      if (line.length > 1 && first && !charges.some((source) => source.q > 0 && nearCharge(first, source))) {
        candidates.push({ angle, line });
      }
    }
  }
  candidates.sort((a, b) => a.angle - b.angle);
  const selectedCount = Math.min(needed, candidates.length);
  const selected: Point[][] = [];
  for (let i = 0; i < selectedCount; i++) {
    const candidate = candidates[Math.floor(((i + 0.5) * candidates.length) / selectedCount)];
    if (candidate) {
      selected.push(candidate.line);
    }
  }
  return selected;
}

/** Trace symmetric, charge-connected curves around the null of an equal like-charge pair. */
function symmetricPairFieldLines(charges: readonly Charge[], bounds: FieldBounds, count: number): Point[][] | null {
  const a = charges[0];
  const b = charges[1];
  if (charges.length !== 2 || !a || !b || a.q !== b.q) {
    return null;
  }
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const separation = Math.hypot(dx, dy);
  const offset = 4 * FIELD_NULL_STOP_SCALE;
  if (separation <= 2 * (CHARGE_RADIUS + offset)) {
    return null;
  }
  const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  if (midpoint.x < bounds.minX || midpoint.x > bounds.maxX || midpoint.y < bounds.minY || midpoint.y > bounds.maxY) {
    return null;
  }
  const lines: Point[][] = [];
  const lineCount = Math.round(count * Math.abs(a.q));
  for (const charge of [a, b]) {
    const orientation = charge === a ? 1 : -1;
    const inward = { x: (orientation * dx) / separation, y: (orientation * dy) / separation };
    for (let i = 0; i < lineCount; i++) {
      const angle = (2 * Math.PI * (i + 0.5)) / lineCount;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      let seed = {
        x: charge.x + 0.18 * (inward.x * cos - inward.y * sin),
        y: charge.y + 0.18 * (inward.y * cos + inward.x * sin),
      };
      if (i === 0 || i === lineCount - 1) {
        // Move the two innermost seeds close to the null, on this charge's side.
        // Bidirectional tracing connects each to the charge and the board edge.
        // The finite offset avoids the undefined direction at the exact zero.
        const side = i === 0 ? 1 : -1;
        seed = {
          x: midpoint.x - offset * inward.x - side * offset * inward.y,
          y: midpoint.y - offset * inward.y + side * offset * inward.x,
        };
      }
      const line = traceFieldLineFromCharges(charges, seed, bounds);
      if (line.length > 1) {
        lines.push(line);
      }
    }
  }
  return lines;
}

/** Seed around sources and fill each sink's remaining lines from the board edge. */
export function automaticFieldLines(sourceCharges: readonly Charge[], bounds: FieldBounds, count = 12): Point[][] {
  const charges = combineCoincidentCharges(sourceCharges);
  const symmetricLines = symmetricPairFieldLines(charges, bounds, count);
  if (symmetricLines) {
    return symmetricLines;
  }
  const lines: Point[][] = [];
  const sinks = charges.filter((charge) => charge.q < 0);
  const arrivals = sinks.map(() => 0);

  for (const sourceCharge of charges.filter((charge) => charge.q > 0)) {
    const lineCount = Math.round(count * sourceCharge.q);
    for (let i = 0; i < lineCount; i++) {
      const angle = (2 * Math.PI * i) / lineCount;
      const seed = {
        x: sourceCharge.x + 0.18 * Math.cos(angle),
        y: sourceCharge.y + 0.18 * Math.sin(angle),
      };
      const line = traceFieldLineFromCharges(charges, seed, bounds);
      const last = line.at(-1);
      if (line.length > 1 && last) {
        lines.push(line);
        const sinkIndex = sinks.findIndex((sink) => nearCharge(last, sink));
        if (sinkIndex >= 0) {
          arrivals[sinkIndex] = (arrivals[sinkIndex] ?? 0) + 1;
        }
      }
    }
  }

  for (const [sinkIndex, charge] of sinks.entries()) {
    const lineCount = Math.round(count * -charge.q);
    const needed = Math.max(0, lineCount - (arrivals[sinkIndex] ?? 0));
    if (needed === 0) {
      continue;
    }
    lines.push(...incomingLines(charges, charge, bounds, lineCount, needed));
  }
  return lines;
}

/** Unit vector perpendicular to E, i.e. tangent to the local equipotential. */
function equipotentialDirection(charges: readonly Charge[], p: Point): Point | null {
  const tangent = direction(charges, p);
  return tangent ? { x: -tangent.y, y: tangent.x } : null;
}

/** Pulls a point back onto V = target along the field, cancelling integration drift. */
function projectOntoPotential(charges: readonly Charge[], p: Point, target: number): Point {
  const field = electricFieldFromCharges(charges, p);
  const magnitude2 = field.x * field.x + field.y * field.y;
  const potential = electricPotentialFromCharges(charges, p);
  if (!(Number.isFinite(magnitude2) && Number.isFinite(potential)) || magnitude2 < 1e-12) {
    return p;
  }
  // E = −∇V, so a Newton step toward the target potential moves along +E when V is too high.
  const scale = (potential - target) / magnitude2;
  return { x: p.x + scale * field.x, y: p.y + scale * field.y };
}

function traceEquipotentialOneWay(
  charges: readonly Charge[],
  seed: Point,
  bounds: FieldBounds,
  target: number,
  sign: 1 | -1,
): { points: Point[]; closed: boolean } {
  const points: Point[] = [];
  const step = 0.03;
  let current = seed;
  let travelled = 0;
  for (let i = 0; i < 2000; i++) {
    const k1 = equipotentialDirection(charges, current);
    if (!k1) {
      break;
    }
    const k2 = equipotentialDirection(charges, {
      x: current.x + (sign * step * k1.x) / 2,
      y: current.y + (sign * step * k1.y) / 2,
    });
    const k3 =
      k2 &&
      equipotentialDirection(charges, {
        x: current.x + (sign * step * k2.x) / 2,
        y: current.y + (sign * step * k2.y) / 2,
      });
    const k4 =
      k3 && equipotentialDirection(charges, { x: current.x + sign * step * k3.x, y: current.y + sign * step * k3.y });
    if (!(k2 && k3 && k4)) {
      break;
    }
    const next = projectOntoPotential(
      charges,
      {
        x: current.x + (sign * step * (k1.x + 2 * k2.x + 2 * k3.x + k4.x)) / 6,
        y: current.y + (sign * step * (k1.y + 2 * k2.y + 2 * k3.y + k4.y)) / 6,
      },
      target,
    );
    if (!Number.isFinite(next.x + next.y)) {
      break;
    }
    travelled += Math.hypot(next.x - current.x, next.y - current.y);
    points.push(next);
    current = next;
    // A closed loop returns to the seed after travelling well away from it.
    if (travelled > 4 * step && Math.hypot(current.x - seed.x, current.y - seed.y) < step * 0.75) {
      return { points, closed: true };
    }
    if (current.x < bounds.minX || current.x > bounds.maxX || current.y < bounds.minY || current.y > bounds.maxY) {
      break;
    }
  }
  return { points, closed: false };
}

/**
 * Traces the equipotential through the seed. Closed curves return to the seed; open curves
 * are traced in both directions until they leave the bounds.
 */
export function traceEquipotential(sourceCharges: readonly Charge[], seed: Point, bounds: FieldBounds): Point[] {
  const charges = combineCoincidentCharges(sourceCharges);
  const target = electricPotentialFromCharges(charges, seed);
  if (charges.length === 0 || !Number.isFinite(target) || !direction(charges, seed)) {
    return [];
  }
  const forward = traceEquipotentialOneWay(charges, seed, bounds, target, 1);
  if (forward.closed) {
    return [seed, ...forward.points, seed];
  }
  const backward = traceEquipotentialOneWay(charges, seed, bounds, target, -1).points.reverse();
  return [...backward, seed, ...forward.points];
}

/** Potential (V) at which the voltage map reaches full red or blue by default. */
export const POTENTIAL_SATURATION = 40;

/** Coarse spacing used to choose an automatic voltage scale from the visible board. */
const AUTO_SATURATION_SAMPLE_M = 0.25;

/** Share of board samples allowed to sit at full red or blue under the automatic scale. */
const AUTO_SATURATION_PERCENTILE = 0.9;

const AUTO_SATURATION_MIN = 5;
const AUTO_SATURATION_MAX = 500;

/**
 * Full-scale potential (V) for the voltage map. Fixed choices are ±10, ±40, and ±200 V.
 * Automatic uses the 90th percentile of |V| on the visible board, so a sparse arrangement
 * is not painted gray and a crowded one is not painted solid red or blue. Samples inside
 * charge disks are omitted.
 */
export function potentialSaturation(scale: VoltageScale, charges: readonly Charge[], bounds: FieldBounds): number {
  if (scale !== "auto") {
    return Number(scale);
  }
  const combined = combineCoincidentCharges(charges);
  if (combined.length === 0) {
    return POTENTIAL_SATURATION;
  }
  const magnitudes: number[] = [];
  const x0 = bounds.minX + AUTO_SATURATION_SAMPLE_M / 2;
  const y0 = bounds.minY + AUTO_SATURATION_SAMPLE_M / 2;
  for (let y = y0; y < bounds.maxY; y += AUTO_SATURATION_SAMPLE_M) {
    for (let x = x0; x < bounds.maxX; x += AUTO_SATURATION_SAMPLE_M) {
      const potential = electricPotentialFromCharges(combined, { x, y });
      if (Number.isFinite(potential)) {
        magnitudes.push(Math.abs(potential));
      }
    }
  }
  if (magnitudes.length === 0) {
    return POTENTIAL_SATURATION;
  }
  magnitudes.sort((a, b) => a - b);
  const index = Math.min(magnitudes.length - 1, Math.floor(AUTO_SATURATION_PERCENTILE * (magnitudes.length - 1)));
  const sample = magnitudes[index] ?? POTENTIAL_SATURATION;
  return Math.min(AUTO_SATURATION_MAX, Math.max(AUTO_SATURATION_MIN, sample));
}

/** Signed potential mapped to [−1, 1] for the red/blue voltage colouring. */
export function potentialColorFraction(potential: number, saturation = POTENTIAL_SATURATION): number {
  if (Number.isNaN(potential) || !(saturation > 0)) {
    return 0;
  }
  return Math.max(-1, Math.min(1, potential / saturation));
}

/** Grid spacing for the field-zero search (metres). */
const FIELD_ZERO_GRID_M = 0.5;

/** A refined point counts as a zero when |E| is below this (V/m). */
const FIELD_ZERO_RESIDUAL = 1e-4;

/** Zeros closer than this are the same point (metres). */
const FIELD_ZERO_MERGE_M = 0.25;

const FIELD_ZERO_MAX_STEP_M = 0.6;
const FIELD_ZERO_MAX_TRAVEL_M = 1.25;

type FieldSample = { ex: number; ey: number; xx: number; xy: number; yy: number };

/** Electric field and its Jacobian, or null inside a charge disk where E is undefined. */
function fieldSample(charges: readonly Charge[], p: Point): FieldSample | null {
  let ex = 0;
  let ey = 0;
  let xx = 0;
  let xy = 0;
  let yy = 0;
  for (const charge of charges) {
    const dx = p.x - charge.x;
    const dy = p.y - charge.y;
    const r2 = dx * dx + dy * dy;
    if (r2 < CHARGE_RADIUS * CHARGE_RADIUS) {
      return null;
    }
    const r = Math.sqrt(r2);
    const eScale = (K_NC * charge.q) / (r2 * r);
    ex += dx * eScale;
    ey += dy * eScale;
    const jScale = (K_NC * charge.q) / (r2 * r2 * r);
    xx += jScale * (r2 - 3 * dx * dx);
    xy -= jScale * 3 * dx * dy;
    yy += jScale * (r2 - 3 * dy * dy);
  }
  return { ex, ey, xx, xy, yy };
}

function insideFieldBounds(point: Point, bounds: FieldBounds): boolean {
  return point.x >= bounds.minX && point.x <= bounds.maxX && point.y >= bounds.minY && point.y <= bounds.maxY;
}

/** One Newton step toward E = 0, or null when the local Jacobian cannot be inverted. */
function newtonStep(sample: FieldSample): Point | null {
  const det = sample.xx * sample.yy - sample.xy * sample.xy;
  if (!(Math.abs(det) > 1e-8)) {
    return null;
  }
  return {
    x: (-sample.ex * sample.yy + sample.xy * sample.ey) / det,
    y: (sample.xy * sample.ex - sample.xx * sample.ey) / det,
  };
}

/** Walk from a seed to a nearby field zero, staying on the board and outside charge disks. */
function refineFieldZero(charges: readonly Charge[], seed: Point, bounds: FieldBounds): Point | null {
  let current = seed;
  for (let iteration = 0; iteration < 16; iteration++) {
    if (!insideFieldBounds(current, bounds)) {
      return null;
    }
    const sample = fieldSample(charges, current);
    if (!sample) {
      return null;
    }
    if (Math.hypot(sample.ex, sample.ey) < FIELD_ZERO_RESIDUAL) {
      return current;
    }
    const step = newtonStep(sample);
    if (!step || Math.hypot(step.x, step.y) > FIELD_ZERO_MAX_STEP_M) {
      return null;
    }
    const next = { x: current.x + step.x, y: current.y + step.y };
    if (Math.hypot(next.x - seed.x, next.y - seed.y) > FIELD_ZERO_MAX_TRAVEL_M) {
      return null;
    }
    current = next;
  }
  return null;
}

function isFieldLocalMinimum(charges: readonly Charge[], point: Point, bounds: FieldBounds): boolean {
  const sample = fieldSample(charges, point);
  if (!sample) {
    return false;
  }
  const here = Math.hypot(sample.ex, sample.ey);
  const neighbors = [
    { x: point.x + FIELD_ZERO_GRID_M, y: point.y },
    { x: point.x - FIELD_ZERO_GRID_M, y: point.y },
    { x: point.x, y: point.y + FIELD_ZERO_GRID_M },
    { x: point.x, y: point.y - FIELD_ZERO_GRID_M },
  ];
  let compared = 0;
  for (const neighbor of neighbors) {
    if (!insideFieldBounds(neighbor, bounds)) {
      continue;
    }
    const nearby = fieldSample(charges, neighbor);
    if (!nearby) {
      continue;
    }
    compared++;
    if (Math.hypot(nearby.ex, nearby.ey) < here) {
      return false;
    }
  }
  return compared >= 2;
}

/**
 * Isolated points where the electric field cancels. A dipole has none; two like charges,
 * a square of like charges, and a quadrupole each have one at the centre of symmetry.
 * An identically zero field (every charge cancelled) returns no markers.
 */
export function findFieldZeros(sourceCharges: readonly Charge[], bounds: FieldBounds): Point[] {
  const charges = combineCoincidentCharges(sourceCharges);
  if (charges.length === 0) {
    return [];
  }
  const probes = [
    { x: (bounds.minX + bounds.maxX) / 2, y: (bounds.minY + bounds.maxY) / 2 },
    { x: bounds.minX + 0.4, y: bounds.minY + 0.4 },
    { x: bounds.maxX - 0.4, y: bounds.maxY - 0.4 },
  ];
  const uniformlyZero = probes.every((probe) => {
    const sample = fieldSample(charges, probe);
    return sample !== null && Math.hypot(sample.ex, sample.ey) < FIELD_ZERO_RESIDUAL;
  });
  if (uniformlyZero) {
    return [];
  }

  const zeros: Point[] = [];
  const accept = (point: Point | null): void => {
    if (!(point && insideFieldBounds(point, bounds))) {
      return;
    }
    if (zeros.some((other) => Math.hypot(other.x - point.x, other.y - point.y) < FIELD_ZERO_MERGE_M)) {
      return;
    }
    zeros.push(point);
  };

  for (let i = 0; i < charges.length; i++) {
    for (let j = i + 1; j < charges.length; j++) {
      const a = charges[i];
      const b = charges[j];
      if (a && b) {
        accept(refineFieldZero(charges, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, bounds));
      }
    }
  }

  const minI = Math.ceil(bounds.minX / FIELD_ZERO_GRID_M);
  const maxI = Math.floor(bounds.maxX / FIELD_ZERO_GRID_M);
  const minJ = Math.ceil(bounds.minY / FIELD_ZERO_GRID_M);
  const maxJ = Math.floor(bounds.maxY / FIELD_ZERO_GRID_M);
  for (let i = minI; i <= maxI; i++) {
    for (let j = minJ; j <= maxJ; j++) {
      const point = { x: i * FIELD_ZERO_GRID_M, y: j * FIELD_ZERO_GRID_M };
      if (isFieldLocalMinimum(charges, point, bounds)) {
        accept(refineFieldZero(charges, point, bounds));
      }
    }
  }
  return zeros;
}
