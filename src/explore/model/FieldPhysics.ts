/** Coulomb field and adaptive field-line tracing. Coordinates are metres, charges nC. */
export type Point = { x: number; y: number };
export type Charge = Point & { q: number };
export type FieldBounds = { minX: number; maxX: number; minY: number; maxY: number };

export const K_NC = 8.9875517923; // (N m²/C²) × 1 nC, yielding V/m at 1 m.
export const CHARGE_RADIUS = 0.15; // m, visible disk and singularity cutoff.

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
    const tangent = direction(charges, current);
    if (!tangent) {
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
    const next = rk4(charges, current, sign * Math.min(stepSize, closest * 0.38));
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

/** Seed evenly around source charges; for all-negative configurations, trace backward from sinks. */
export function automaticFieldLines(charges: readonly Charge[], bounds: FieldBounds, count = 12): Point[][] {
  const sources = charges.some((charge) => charge.q > 0) ? charges.filter((charge) => charge.q > 0) : charges;
  const lines: Point[][] = [];
  for (const charge of sources) {
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count;
      const seed = { x: charge.x + 0.18 * Math.cos(angle), y: charge.y + 0.18 * Math.sin(angle) };
      const line = traceFieldLine(charges, seed, bounds);
      if (line.length > 1) {
        lines.push(line);
      }
    }
  }
  return lines;
}
