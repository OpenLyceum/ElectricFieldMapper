# Implementation notes

The simulation was scaffolded from `SceneryStackTemplate` and uses a single Explore screen. The published PhET `Charges and Fields` source under `/home/veillette/totality/charges-and-fields` informed the point-charge field and potential formulas the charge and sensor appearance, the voltage-map colours, and the voltmeter with equipotential plotting. The local `/home/veillette/vgit/charges-and-fields` fork supplied the bidirectional RK4 field-line approach. This repo implements its own model and CanvasNode drawing with SceneryStack package imports.

The model owns each charge's reactive position, overlay toggles, field sensors, the voltmeter state, equipotential seeds, and the manual field-line seeds. `changeCountProperty` invalidates the canvas when a charge or seed changes. Vector arrows are sampled on a half-metre grid; displayed length and opacity compress the large range of physical strengths, while sensor and voltmeter readouts use physical values.

Named charge configurations live in `ChargePresets.ts`; the model rebuilds charges when one is selected and marks the arrangement Custom after a manual charge edit. The shared `GRID_SPACING_M` constant drives both the drawn grid and charge snapping.

A background rectangle receives taps when line drawing is selected. A button places a line at the voltmeter crosshair, giving keyboard users the same action. Charges, sensors, and the voltmeter use `RichDragListener` for pointer and keyboard dragging. The board and controls have accessible names, and the screen summary updates its charge and drawn-line counts.

The board fits the SceneryStack 1024 × 618 design space with a panel on the right. The rendering canvas, draggable charges, sensors, and voltmeter are separate nodes so pointer interaction does not require regenerating the physics drawing. Profile color properties supply both normal and projector palettes.

## Field-line density preference

- The Simulation preference changes automatic seeds from twelve to twenty per source charge.
- It is also available through the public `?denseFieldLines=true` query parameter.
- The preference property is shared with the Explore model and directly invalidates the canvas.
- User placed line seeds are unaffected by the preference.

## Rendering and input boundaries

- The canvas clips all vector and line drawings to the board.
- Charge, sensor, and voltmeter nodes sit above the canvas and panel for reliable dragging.
- A charge disk masks the singularity in numeric samples.
- Sensor and voltmeter readouts sit on the tools themselves, as in Charges and Fields.
