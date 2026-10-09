# Electric Field Mapper model

The Explore screen represents static point charges of +1 or −1 nanocoulomb at positions in metres. It starts with a dipole unless a launch parameter selects another configuration. Any number of charges can be added without replacing the others. Model x increases to the right and model y increases downward; sensor angles are reported counterclockwise from +x.

The field fills the visible screen behind the controls. Resizing the window reveals more field, with a fixed scale of 83 design pixels per metre, up to x = −16 to 16 m and y = −12 to 12 m. The model's initial bounds, before the view supplies the visible area, are x = −4 to 4 m and y = −3 to 3 m. Shrinking the window brings charges and tools back into view without changing the selected configuration to Custom.

## Charge arrangements and the grid

The configuration selector offers a dipole, two positive charges, a line of positive charges, an alternating charge line, a square of positive charges, a quadrupole, and parallel plates. The last arrangement is two columns of three point charges; it illustrates plate-like behavior without modelling continuous conducting plates. The `preset` query parameter selects the same arrangements, or `custom` for an empty opening board. Choosing Custom on an existing board keeps its charges.

Moving, adding, or removing a charge selects Custom. Selecting a named configuration replaces the charges and clears drawn field and equipotential seeds. Manual charge edits keep those seeds, and their curves are recalculated for the new field.

Major grid lines and charge snap points are 0.5 m apart; minor lines are 0.1 m apart. With snapping enabled, charges settle on major grid points at least 0.5 m inside the visible field edge. Keyboard movement then advances one major grid square per step, including with Shift held. **Values** and **Grid** together show a one-metre scale arrow.

## Field and potential

Outside the masked charge disks, the field and potential are the superpositions

```text
E(r) = Σ K_NC qᵢ (r − rᵢ) / |r − rᵢ|³
V(r) = Σ K_NC qᵢ / |r − rᵢ|
```

Here `K_NC = 8.9875517923` includes the conversion from nanocoulombs, so E is in V/m and V is in volts. Potential is referenced to zero at infinity. The ideal field is singular at each point charge. The simulation masks a disk of radius 0.15 m around each net source: inside it the field sample is undefined and the potential sample is represented as signed infinity. Sensors show a dash and the voltmeter shows ±∞ there. This cutoff is a rendering and numerical convention, not the field inside a physical charged sphere.

Charges at exactly the same position combine into a net source before sampling or tracing. Equal positive and negative charges cancel completely, including within their coincident disks. They remain separately draggable; separating them restores their fields. Unequal coincident charges behave as their net charge. During a pointer drag, charges outside the visible field are excluded from the field calculation; releasing them away from a toolbox returns them to the field.

Sampled field arrows sit on a fixed 0.5 m lattice halfway between major grid lines. They point along E. Their length is compressed logarithmically by default, or set to direction only or clipped linear in Preferences. These display lengths do not change the physical readings from sensors or the voltmeter.

## Field lines and field zeros

Field lines are integral curves of the unit field direction, not trajectories of moving test charges. The tracer integrates both ways from a seed with fourth-order Runge–Kutta steps. Steps shrink near charges, sharp turns, and field zeros, and grow on straighter segments. Tracing ends at the visible boundary, a masked disk, a zero or undefined field, or a limit of 900 steps per direction. Curves are ordered along E; optional arrowheads follow that order, about every 0.65 m.

Automatic lines use twelve seeds per nanocoulomb by default. Preferences offers 8, 12, 16, or 24. Positive sources launch lines; arrivals at negative sources count toward their target density, and additional curves are traced backward from negative sources to fill remaining incoming lines. The finite seed search may not fill every target for arbitrary crowded arrangements. Line density illustrates charge magnitude and is not a quantitative flux measurement. Hand-placed seeds add curves independently of this density preference. **Clear drawn lines** retains automatic lines. **Field lines** controls both automatic and hand-drawn curves; equipotentials have their own seeds and remain visible independently.

Some field lines approach a zero-field point, where their direction becomes undefined. For two equal like charges, the midpoint is such a point. An exactly axial hand-drawn line stops just short of it. Automatic drawing uses reflection-symmetric seeds, including two per charge placed slightly off the axis near the midpoint; these curves bend outward and connect the charge to the visible edge. This construction follows a moved or rotated pair. For negative charges the arrows reverse. A square of equal positive charges also has a central field zero; the information button beside Reset All explains this exception to the usual endpoints at negative charges or infinity.

The optional **Mark field zeros** preference searches the visible field with a coarse grid and a bounded Newton refinement. It marks isolated zeros, such as the midpoint of two like charges, the centre of a quadrupole, and the five zeros of the square preset. It is a numerical search and can miss closely spaced or poorly conditioned zeros. An empty or completely cancelled arrangement produces no isolated markers.

## Voltage map and equipotentials

**Voltage** samples V in 0.05 m cells and blends from the board colour at zero toward red for positive and blue for negative potential. The image is smoothed when scaled. The default full scale is ±40 V. Preferences also offers ±10 V, ±200 V, or automatic scaling. Automatic scaling takes the 90th percentile of finite |V| samples on a coarse 0.25 m grid, clamped to 5–500 V; an empty field uses 40 V. Numeric readings remain unsaturated.

The voltmeter measures V at its crosshair, and its ring uses the map's voltage scale. The pencil button stores an equipotential seed there, outside a small exclusion region around each net source. RK4 steps run perpendicular to E, followed by the Newton correction

```text
r ← r + (V(r) − V₀) E / |E|²
```

This projection reduces numerical drift from the target voltage. A curve that returns near its seed closes; otherwise it is traced both ways until it leaves the visible field, loses a usable direction, or reaches 2,000 steps per direction. **Values** labels each curve with its seed's current potential. Moving charges recalculates both that potential and the curve. The eraser clears all equipotential seeds.

## Measuring tools and reset

Electric field sensors show a red arrow linear in |E| at 12 pixels per V/m, capped at 300 pixels near charges. **Values** adds the magnitude in V/m and direction in degrees. At a field zero the arrow and direction disappear while the strength reads zero.

The measuring tape reports the distance between its draggable ends in centimetres. With both snapping and the grid enabled, its ends snap to the minor 0.1 m grid on release. The voltmeter and tape readings remain visible when **Values** is off. Charges and sensors can be returned to their box; the voltmeter and tape can be returned to Tools. Keyboard users can add tools with Enter or Space, move them with arrows or WASD, and remove or put them away with Delete or Backspace.

Reset All clears drawn seeds and sensors, puts away the voltmeter and tape, restores their positions, and restores the opening configuration and checkbox values from the URL. Simulation preferences survive Reset All. See [implementation notes](implementation-notes.md#launch-query-parameters) for the launch parameters and defaults.
