# AGENTS.md — Electric Field Mapper

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md).

## Project

Single-screen SceneryStack simulation for mapping electric fields from movable point charges — vectors, field lines, voltage colouring, voltmeter, and measuring tape. Inspired by PhET's *Charges and Fields* plus a local RK4 field-line extension. Charges are in nC; coordinates are in metres.

Physics for educators: `doc/model.md`. Architecture: `doc/implementation-notes.md`.

## Key files

| File | Purpose |
|---|---|
| `src/ElectricFieldMapperColors.ts` | Profile color properties |
| `src/ElectricFieldMapperConstants.ts` | Physics/tracing, tool coords, rendering, grid/layout |
| `src/ElectricFieldMapperNamespace.ts` | Namespace for color property names |
| `src/explore/ExploreScreen.ts` | Screen wrapper |
| `src/explore/model/ExploreModel.ts` | Charges, sensors, display toggles, tools, line seeds, bounds |
| `src/explore/model/FieldPhysics.ts` | Coulomb field/potential + adaptive RK4 field-line / equipotential tracers |
| `src/explore/view/ExploreScreenView.ts` | Board, toolboxes, controls, reset, layout |
| `src/explore/view/FieldCanvasNode.ts` | Voltage map, equipotentials, grid, field lines, vectors |
| `src/explore/view/ChargeNode.ts` | Pointer/keyboard charge dragging |
| `src/common/ChargeRepresentationNode.ts` | Shaded charge spheres |
| `src/common/model/ChargePresets.ts` | Named charge arrangements |
| `src/common/ElectricFieldMapperHotkeyData.ts` | Delete/Backspace bindings shared with keyboard help |
| `src/preferences/electricFieldMapperQueryParameters.ts` | Opening checkbox/combo/preset URL params |
| `src/i18n/StringManager.ts` | Localized strings (en/es/fr) |

## Model

- `FieldPhysics.ts` has pure Coulomb calculations plus a bidirectional adaptive RK4 field-line tracer and an RK4 equipotential tracer with a Newton projection back onto the target potential. `K_NC` converts nC charges to V/m and V.
- `ExploreModel.ts` owns charge instances, electric field sensors, display toggles (including the voltage map and the Values checkbox), drawn line seeds, the voltmeter and measuring tape, equipotential seeds, and `fieldBoundsProperty` (visible field in metres, set by the view and capped at `ENLARGED_FIELD_BOUNDS`). `changeCountProperty` invalidates the canvas on charge edits. Opening checkbox and combo-box values come from `electricFieldMapperQueryParameters.ts` (`showVectors`, `showLines`, `automaticLines`, `showVoltage`, `showValues`, `showGrid`, `snapToGrid`, `drawMode`, and `preset`). Reset All restores that opening state. Simulation preferences (`voltageScale`, `arrowScale`, `fieldLineArrowheads`, `linesPerNanocoulomb`, `showFieldZeros`) live on the preferences model and survive Reset All.
- Selecting a charge preset clears drawn field and equipotential lines; manual charge edits select Custom. `GRID_SPACING_M` sets major grid lines and charge snapping; `GRID_MINOR_LINES_PER_MAJOR` sets the minor lines.
- `FieldCanvasNode.ts` paints the red/blue voltage map (`potentialColor.ts`, saturating at the voltage-scale preference; default full scale is `POTENTIAL_SATURATION`), equipotentials (labelled when Values is on), the grid, automatic and drawn field lines (with optional arrowheads), field-zero markers, and sampled vector arrows. Field arrows point in the actual E direction. Length is logarithmic by default, or direction-only, or clipped linear, from the arrow-length preference.
- `ElectricFieldSensorNode.ts`, `VoltmeterNode.ts`, and scenery-phet's `MeasuringTapeNode` are the Charges-and-Fields-style measuring tools. `GridScaleNode.ts` draws the one-metre double arrow when Values and the grid are on. A half-scale scenery-phet `InfoButton` sits beside Reset All and opens a dialog on the exception to field lines ending at negative charges or infinity. As in Charges and Fields, the board has no frame: it follows `visibleBoundsProperty`, so a wider or taller window reveals more field and pushes the panel, hint, and reset button to the window edges.
- Drag movement uses the framework arrow/WASD bindings; snapped charges move one 0.5 m square per step even with Shift held.
- `FieldPhysics.ts` retains local aliases for its named physical quantities; `ExploreModel.ts` retains the typed field-bounds objects.

## Physics notes

The ideal point-charge field is singular at a charge. `CHARGE_RADIUS` masks that disk in sampling and stops integration before singularities. Field-line density is illustrative, not a quantitative flux measurement. Field sensors and the voltmeter report the unsaturated physical field and potential outside charge disks. The measuring tape reports distance in centimetres. Some field lines approach a zero-field point, where the field has no direction. The center of the square of equal positive charges is one example.

## Interaction quirks

- Do not change PDOM content (e.g. `accessibleParagraph`) of a focused node on every position change: it rebuilds the element and interrupts keyboard drags. Sensors and the voltmeter announce readings with `addAccessibleObjectResponse` on release instead.
- The voltmeter's focusable drag handle and its buttons are siblings, so keys on a focused button never start a drag. The drag listener uses `targetNode` set to the translated outer node.
- Keyboard drags are bounded to the visible field (`model.keyboardDragBoundsProperty`); pointer drags may leave it to reach a toolbox and are clamped on release. Shrinking the window moves items back into view via `keepItemsInField`, which does not switch the preset to Custom.

## Local reference material

- Published PhET source: `/home/veillette/totality/charges-and-fields`.
- Existing RK4 field-line fork: `/home/veillette/vgit/charges-and-fields/js/charges-and-fields/model/ElectricFieldLine.ts`.

## Testing

Run `npm run lint && npm run check && npm run build && npm test` in this directory, then `npm run test:fuzz:quick`. Run sim-specific browser regressions with `npx playwright test tests/browser`. Persistent screen/model/tool nodes live for the simulation lifetime; dynamically removed charge and sensor nodes require full disposal. The memory-leak suite covers the dynamic model objects and the `ChargeNode` / `ElectricFieldSensorNode` views against a live model, items and a11y strings.

## Compliance carve-outs

- **Hardcoded colors (computed):** `src/explore/view/potentialColor.ts` generates RGB/RGBA CSS by blending `ElectricFieldMapperColors` profile values; this is not an independent hardcoded palette.

## Accessibility

Follow [Baton/ACCESSIBILITY.md](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md): PDOM names, per-screen `*ScreenSummaryContent`, and keyboard-help content. Document any intentional deviations under Compliance carve-outs.
