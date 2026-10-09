/** Coulomb field and adaptive field-line tracing. Coordinates are metres, charges nC. */
export type Point = { x: number; y: number };
export type Charge = Point & { q: number };
export type FieldBounds = { minX: number; maxX: number; minY: number; maxY: number };

export const K_NC = 8.9875517923; // (N m²/C²) × 1 nC, yielding V/m at 1 m.
export const CHARGE_RADIUS = 0.15; // m, visible disk and singularity cutoff.
const FIELD_NULL_STOP_SCALE = 0.002; // m, below a screen pixel at the standard board scale.
const FIELD_NULL_STEP_FRACTION = 0.45;

export function electricField(charges: readonly Charge[], p: Point): Point {
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
  const field = electricField(charges, p);
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
    const field = electricField(charges, current);
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
      const line = traceFieldLine(charges, seed, bounds);
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

/** Seed around sources and fill each sink's remaining lines from the board edge. */
export function automaticFieldLines(charges: readonly Charge[], bounds: FieldBounds, count = 12): Point[][] {
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
      const line = traceFieldLine(charges, seed, bounds);
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
  const field = electricField(charges, p);
  const magnitude2 = field.x * field.x + field.y * field.y;
  const potential = electricPotential(charges, p);
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
export function traceEquipotential(charges: readonly Charge[], seed: Point, bounds: FieldBounds): Point[] {
  const target = electricPotential(charges, seed);
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

/** Potential (V) at which the voltage map reaches full red or blue. */
export const POTENTIAL_SATURATION = 40;

/** Signed potential mapped to [−1, 1] for the red/blue voltage colouring. */
export function potentialColorFraction(potential: number): number {
  if (Number.isNaN(potential)) {
    return 0;
  }
  return Math.max(-1, Math.min(1, potential / POTENTIAL_SATURATION));
}
