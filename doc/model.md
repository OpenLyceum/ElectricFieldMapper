# Electric Field Mapper model

The Explore screen represents each point charge with a sign (`+1` or `−1` nanocoulomb) and a position in metres. The board covers x = −4 to 4 m and y = −3 to 3 m. New charges can be added without changing the existing charges.

The configuration selector replaces the charge arrangement with a dipole, like pair, line, alternating line, square, quadrupole, or parallel plates. Moving, adding, or removing a charge switches the selector to Custom. Selecting a configuration clears drawn field and equipotential lines because their seeds depend on the previous arrangement. When snapping is enabled, charges align to the 0.5 m grid and stay at least one grid step inside the board edge.

At any position outside a charge disk, the field is the superposition

```text
E(r) = Σ k qᵢ (r − rᵢ) / |r − rᵢ|³
V(r) = Σ k qᵢ / |r − rᵢ|
```

Here `k = 8.9875517923` after converting charges from nC, so E is in V/m and V is in volts. Inside a radius of 0.15 m around a charge, the ideal point-charge field is singular; the model returns an undefined field and infinite potential. Sensors show a dash and the voltmeter shows ±∞ there.

Field lines are integral curves of the **unit field direction**, not trajectories of moving test charges. Their geometry follows E while their spacing is an illustrative choice. The tracer integrates in both directions with fourth-order Runge–Kutta steps. A step is reduced when the direction turns sharply or a charge is near, and grows gently on straighter segments. Tracing ends at the board boundary, a charge disk, a zero or undefined field, or the 900-step limit per direction. Lines are ordered in the direction of E, and arrows use that order.

Automatic lines use twelve seeds per nanocoulomb of positive charge (twenty in dense mode). Each negative charge gets the same number of arriving lines per nanocoulomb: lines already traced from positive charges count toward this total, and the remaining lines are traced backward from the negative charge to the board edge. This shows the lines entering a dipole's negative charge from outside the board without drawing a second copy of the source-to-sink lines. These counts illustrate charge magnitude; drawn line density is not a quantitative flux measurement. User placed seeds add extra lines; clearing them leaves automatic lines intact.

## Electric potential tools

The **Voltage** overlay samples V on a 0.05 m grid and blends from the board colour at 0 V toward red (positive) or blue (negative), saturating at ±40 V, as in PhET's *Charges and Fields*. The image is smoothed when scaled to the board.

The voltmeter reads V at its crosshair. Its pencil button records an equipotential seed; the curve through it is traced with RK4 steps perpendicular to E, and each step is followed by a Newton correction `r ← r + (V(r) − V₀) E / |E|²` so numerical drift does not accumulate. A curve that returns to its seed is closed; otherwise it is traced both ways until it leaves the board. When **Values** is on, each curve is labelled with its potential.

Electric field sensors show a red arrow linear in |E| (12 px per V/m), capped at 300 px near charges. **Values** adds the magnitude in V/m and the direction in degrees counter-clockwise from +x. The voltmeter readout stays visible either way.
