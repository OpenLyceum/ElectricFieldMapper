# AGENTS.md — Electric Field Mapper

This is a single-screen SceneryStack simulation. Follow the shared guidance in `../.github/AGENTS.md`, then the conventions in `../Baton/CONVENTIONS.md` and `../Baton/ACCESSIBILITY.md`.

## Architecture

- `src/explore/model/FieldPhysics.ts` has pure Coulomb field and potential calculations plus a bidirectional adaptive RK4 field-line tracer and an RK4 equipotential tracer with a Newton projection back onto the target potential. Charges are in nC and coordinates in metres; `K_NC` converts to V/m and V.
- `src/explore/model/ExploreModel.ts` owns charge instances, electric field sensors, display toggles (including the voltage map and the Values checkbox for numeric labels and the grid scale arrow), drawn line seeds, the voltmeter and measuring tape (active flags and positions), equipotential seeds, and `fieldBoundsProperty` (the visible field in metres, set by the view and capped at `ENLARGED_FIELD_BOUNDS`). `changeCountProperty` invalidates the canvas on charge edits. Opening checkbox and combo-box values come from `src/preferences/electricFieldMapperQueryParameters.ts` (`showVectors`, `showLines`, `automaticLines`, `showVoltage`, `showValues`, `showGrid`, `snapToGrid`, `drawMode`, `denseFieldLines`, and `preset`). Reset All restores that opening state.
- `src/explore/model/ChargePresets.ts` defines named charge arrangements. Selecting one clears drawn field and equipotential lines; manual charge edits select Custom. `GRID_SPACING_M` sets major grid lines and charge snapping; `GRID_MINOR_LINES_PER_MAJOR` sets the minor lines.
- `src/explore/view/FieldCanvasNode.ts` paints the red/blue voltage map (`potentialColor.ts`, saturating at `POTENTIAL_SATURATION`), equipotentials (labelled when Values is on), the grid, automatic and drawn field lines, and sampled vector arrows. Field arrows point in the actual E direction; opacity and length are compressed logarithmically for display.
- `src/common/ChargeRepresentationNode.ts` draws the shaded charge spheres. `src/explore/view/ChargeNode.ts` gives charges pointer and keyboard dragging. `ElectricFieldSensorNode.ts`, `VoltmeterNode.ts`, and scenery-phet's `MeasuringTapeNode` are the Charges-and-Fields-style measuring tools. `GridScaleNode.ts` draws the one-metre double arrow when Values and the grid are on. `ExploreScreenView.ts` lays out the board, charge/sensor box, tools box, controls, and reset. A half-scale scenery-phet `InfoButton` sits beside Reset All and opens a dialog on why field lines can meet at a point in this plane. As in Charges and Fields, the board has no frame: it follows `visibleBoundsProperty`, so a wider or taller window reveals more field and pushes the panel, hint, and reset button to the window edges.
- `src/i18n/strings_*.json` holds English, Spanish, and French strings. All interactive controls must retain accessible names.

## Physics notes

The ideal point-charge field is singular at a charge. `CHARGE_RADIUS` masks that disk in sampling and stops integration before singularities. Field-line density is illustrative, not a quantitative flux measurement. Field sensors and the voltmeter report the unsaturated physical field and potential outside charge disks. The measuring tape reports distance in centimetres. Field lines can meet at one point in this plane; in three dimensions they would leave the plane, which the 2D drawing cannot show.

## Interaction quirks

- Do not change PDOM content (e.g. `accessibleParagraph`) of a focused node on every position change: it rebuilds the element and interrupts keyboard drags. Sensors and the voltmeter announce readings with `addAccessibleObjectResponse` on release instead.
- The voltmeter's focusable drag handle and its buttons are siblings, so keys on a focused button never start a drag. The drag listener uses `targetNode` set to the translated outer node.
- Keyboard drags are bounded to the visible field (`model.keyboardDragBoundsProperty`); pointer drags may leave it to reach a toolbox and are clamped on release. Shrinking the window moves items back into view via `keepItemsInField`, which does not switch the preset to Custom.

## Local reference material

- Published PhET source: `/home/veillette/totality/charges-and-fields`.
- Existing RK4 field-line fork: `/home/veillette/vgit/charges-and-fields/js/charges-and-fields/model/ElectricFieldLine.ts`.

## Validation

Run `npm run lint && npm run check && npm run build && npm test` in this directory.

## Compliance carve-outs

- **Template drift:** `prepare` guards on the local Git root. This new checkout currently has no writable member-repo `.git`, so an unguarded `npm install` would otherwise change the parent superproject hook setting.
