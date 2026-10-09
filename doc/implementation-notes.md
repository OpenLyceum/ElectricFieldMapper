# Implementation notes

The simulation was scaffolded from `SceneryStackTemplate` and uses a single Explore screen. The published PhET `Charges and Fields` source under `/home/veillette/totality/charges-and-fields` informed the point-charge field and potential formulas, the charge and sensor appearance, the voltage-map colours, and the voltmeter with equipotential plotting. The local `/home/veillette/vgit/charges-and-fields` fork supplied the bidirectional RK4 field-line approach. This repo implements its own model and CanvasNode drawing with SceneryStack package imports.

The model owns each charge's reactive position, overlay toggles (including Values for sensor and equipotential numbers and the grid scale arrow), field sensors, voltmeter and measuring tape state, equipotential seeds, and manual field-line seeds. `changeCountProperty` invalidates the canvas when a charge or seed changes. `ChargeNode` listens to charge positions and calls `notifyChanged()` during dragging; the pure model computes snapshots from the current positions. Snapshots exclude charges outside the visible field and combine coincident charges into net sources before applying singularity cutoffs. Vector arrows are sampled on a half-metre grid. Their length follows the Arrow length preference: compressed (the default logarithm), direction only, or clipped linear. Sensor and voltmeter readouts stay in physical units. The voltmeter ring uses the same voltage colour scale as the map.

Named charge configurations live in `ChargePresets.ts`; the model rebuilds charges when one is selected and marks the arrangement Custom after a manual charge edit. The shared `GRID_SPACING_M` constant drives the 0.5 m major grid and charge snapping. `GRID_MINOR_LINES_PER_MAJOR` divides it into five 0.1 m intervals. The measuring tape snaps to minor lines on release when both the grid and snapping are enabled.

A background rectangle receives taps when line drawing is selected. A button places a line at the voltmeter crosshair, giving keyboard users the same action. Charges, sensors, and the voltmeter use `RichDragListener` for pointer and keyboard dragging. The tape uses scenery-phet’s `MeasuringTapeNode`, with both ends keyboard accessible and units multiplied by 100 to display centimetres. Toolbox items forward pointer presses to newly placed tools, or place and focus them on Enter or Space. `ElectricFieldMapperHotkeyData.ts` shares Delete/Backspace bindings between object listeners and the localized keyboard-help dialog. The screen summary describes charge and sensor counts, both tools, voltage and Values state, and drawn field/equipotential counts. A wrapper Node supplies explicit PDOM order, with Reset All last.

The board fills `visibleBoundsProperty`, using a transform whose model origin is at design position (369, 284) and whose scale is 83 pixels per metre. Model y increases downward. The right panel, bottom hint, information button, and Reset All follow the visible edges. The view converts these bounds into `fieldBoundsProperty`, caps them at `ENLARGED_FIELD_BOUNDS` (±16 m horizontally and ±12 m vertically), and calls `keepItemsInField()` after resizing. The initial `FIELD_BOUNDS` is only the model’s fallback before layout. The rendering canvas, draggable charges, sensors, and voltmeter are separate nodes so tool hit testing is independent of the canvas drawing. Profile color properties supply both normal and projector palettes, including equipotential label backgrounds and voltmeter artwork. `potentialColor.ts` computes RGB blends from those profile colors; its generated CSS color is not a separate hardcoded palette. Rendering order is voltage map, grid, field lines, equipotentials, vectors, then field-zero markers. `GridScaleNode` draws the one-metre scale separately. A half-size `InfoButton` beside Reset All opens `FieldLinesInfoDialog` to explain lines approaching field zeros.

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

The canvas clips its drawing to the visible field. Charges and tools sit above the canvas and panel so they can be dragged out of their boxes. Pointer dragging may leave the field to reach a toolbox; other releases are clamped back inside. Keyboard drags stay inside `keyboardDragBoundsProperty`, with an inset of 0.18 m. Charge keyboard mapping applies these bounds explicitly before optional grid snapping. Snapped charges advance 0.5 m per key press or repeat even with Shift held. Other drags use smaller movements with Shift.

The voltmeter’s focusable handle and plotting buttons are siblings. Its drag listener targets the translated outer node, preserving the grab offset when the body is dragged. This prevents button keys from moving the tool. Sensors and the voltmeter announce readings on release with `addAccessibleObjectResponse`; they do not rewrite PDOM content on each position change, which would rebuild the focused element and interrupt a keyboard drag. Putting a tool away interrupts its active drag.

## Lifetime and validation

The screen, model, preferences, and persistent measuring-tool nodes live for the duration of the simulation. Their property links are installed once. Charge and sensor nodes are created and disposed as their model objects are added or removed; removal disposes the node before its position property. The canvas and screen-summary classes provide explicit unlinking/disposal for their observers. The disposal suite currently covers `PointCharge` and `ElectricFieldSensor`; it does not constitute a full browser heap audit of the screen.

Pure electrostatics and tracing constants live beside their algorithms in `FieldPhysics.ts`; visible bounds and default tool positions live in `ExploreModel.ts`; shared grid and layout constants live in `ElectricFieldMapperConstants.ts`. Rendering-specific constants are local to their views.

Run `npm run lint && npm run check && npm run build && npm test`, then `npm run test:fuzz:quick`. Browser regressions under `tests/browser/` run with `npx playwright test tests/browser`. The unit suites cover Coulomb superposition, coincident-source cancellation, field and equipotential tracing, field zeros, presets, tool state, launch/reset behavior, arrow scaling, screen descriptions, and disposal of dynamic model objects. See [model.md](model.md) for numerical limits and illustrative line-density behavior.
