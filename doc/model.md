# Electric Field Mapper model

The Explore screen represents each point charge with a sign (`+1` or `−1` nanocoulomb) and a position in metres. The board covers x = −4 to 4 m and y = −3 to 3 m. New charges can be added without changing the existing charges.

At any position outside a charge disk, the field is the superposition

```text
E(r) = Σ k qᵢ (r − rᵢ) / |r − rᵢ|³
V(r) = Σ k qᵢ / |r − rᵢ|
```

Here `k = 8.9875517923` after converting charges from nC, so E is in V/m and V is in volts. Inside a radius of 0.15 m around a charge, the ideal point-charge field is singular; the model returns an undefined field and infinite potential. The probe displays infinity there.

Field lines are integral curves of the **unit field direction**, not trajectories of moving test charges. Their geometry follows E while their spacing is an illustrative choice. The tracer integrates in both directions with fourth-order Runge–Kutta steps. A step is reduced when the direction turns sharply or a charge is near, and grows gently on straighter segments. Tracing ends at the board boundary, a charge disk, a zero or undefined field, or the 900-step limit per direction. Lines are ordered in the direction of E, and arrows use that order.

Automatic lines use twelve evenly spaced seeds around each positive charge. If all charges are negative, negative charges receive seeds so their inward lines are still visible. User placed seeds add extra lines; clearing them leaves automatic lines intact.
