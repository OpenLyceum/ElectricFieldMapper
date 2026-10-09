# Implementation notes

The simulation was scaffolded from `SceneryStackTemplate` and uses a single Explore screen. The published PhET `Charges and Fields` source under `/home/veillette/totality/charges-and-fields` informed the point-charge field and potential formulas the charge and sensor appearance, the voltage-map colours, and the voltmeter with equipotential plotting. The local `/home/veillette/vgit/charges-and-fields` fork supplied the bidirectional RK4 field-line approach. This repo implements its own model and CanvasNode drawing with SceneryStack package imports.

The model owns each charge's reactive position, overlay toggles (including the Values checkbox for sensor and equipotential numbers), field sensors, the voltmeter state, equipotential seeds, and the manual field-line seeds. `changeCountProperty` invalidates the canvas when a charge or seed changes. Vector arrows are sampled on a half-metre grid. Their length follows the Arrow length preference: compressed (the default logarithm), direction only, or clipped linear. Sensor and voltmeter readouts stay in physical units. The voltmeter ring uses the same voltage colour scale as the map.

Named charge configurations live in `ChargePresets.ts`; the model rebuilds charges when one is selected and marks the arrangement Custom after a manual charge edit. The shared `GRID_SPACING_M` constant drives both the drawn grid and charge snapping.

A background rectangle receives taps when line drawing is selected. A button places a line at the voltmeter crosshair, giving keyboard users the same action. Charges, sensors, and the voltmeter use `RichDragListener` for pointer and keyboard dragging. The board and controls have accessible names, and the screen summary updates its charge and drawn-line counts.

The board fits the SceneryStack 1024 × 618 design space with a panel on the right. The rendering canvas, draggable charges, sensors, and voltmeter are separate nodes so pointer interaction does not require regenerating the physics drawing. Profile color properties supply both normal and projector palettes.

## Simulation preferences

These live under Preferences → Simulation, are shared with the Explore model, and survive Reset All. Each has a public query parameter.

- **Voltage color scale** (`voltageScale`): `10`, `40` (default), `200`, or `auto`. The map reaches full red or blue at that many volts. Automatic uses the 90th percentile of |V| on the visible board, clamped to 5–500 V. Sensor and voltmeter numbers stay unsaturated.
- **Arrow length** (`arrowScale`): `compressed` (default), `direction`, or `linear`. Linear arrows reach full length at 30 V/m and stay at least 3 px.
- **Arrowheads on field lines** (`fieldLineArrowheads`, default `true`). Arrowheads sit about every 0.65 m along automatic and hand-drawn lines, in the direction of E.
- **Lines per nanocoulomb** (`linesPerNanocoulomb`): `8`, `12` (default), `16`, or `24`. The count is illustrative. Hand-placed seeds are unaffected.
- **Mark field zeros** (`showFieldZeros`, default `false`). A Newton search marks isolated points where E cancels, such as between two like charges, at the centre of a quadrupole, and off the axis of an alternating line. A square of like charges has the centre plus four more. A dipole has no marker.

## Launch query parameters

Checkboxes, the configuration combo box, and the Simulation preferences take their opening state from the page URL. Each boolean is `true` or `false`. An unrecognized value is ignored and the control keeps its default. Reset All restores the checkboxes and configuration. Simulation preferences stay as they are.

| Parameter | Control | Default |
|---|---|---|
| `showVectors` | Field vectors | `true` |
| `showLines` | Field lines | `true` |
| `automaticLines` | Automatic lines | `true` |
| `showVoltage` | Voltage | `false` |
| `showValues` | Values | `false` |
| `showGrid` | Grid | `true` |
| `snapToGrid` | Snap charges to grid | `false` |
| `drawMode` | Tap to draw | `false` |
| `voltageScale` | Voltage color scale (Preferences) | `40` |
| `arrowScale` | Arrow length (Preferences) | `compressed` |
| `fieldLineArrowheads` | Arrowheads on field lines (Preferences) | `true` |
| `linesPerNanocoulomb` | Lines per nanocoulomb (Preferences) | `12` |
| `showFieldZeros` | Mark field zeros (Preferences) | `false` |
| `preset` | Configurations combo box | `dipole` |

`preset` is one of `custom`, `dipole`, `likePair`, `line`, `alternatingLine`, `square`, `quadrupole`, or `parallelPlates`. `custom` starts with an empty board. Example: `?preset=quadrupole&showVoltage=true&showVectors=false`.

## Rendering and input boundaries

- The canvas clips all vector and line drawings to the board.
- Charge, sensor, and voltmeter nodes sit above the canvas and panel for reliable dragging.
- A charge disk masks the singularity in numeric samples.
- Sensor and voltmeter readouts sit on the tools themselves, as in Charges and Fields.
