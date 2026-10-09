# AGENTS.md — Electric Field Mapper

This is a single-screen SceneryStack simulation. Follow the shared guidance in `../.github/AGENTS.md`, then the conventions in `../Baton/CONVENTIONS.md` and `../Baton/ACCESSIBILITY.md`.

## Architecture

- `src/explore/model/FieldPhysics.ts` has pure Coulomb field and potential calculations plus a bidirectional adaptive RK4 field-line tracer. Charges are in nC and coordinates in metres; `K_NC` converts to V/m and V.
- `src/explore/model/ExploreModel.ts` owns charge instances, display toggles, drawn line seeds, and probe position. `changeCountProperty` invalidates the canvas on charge edits.
- `src/explore/view/FieldCanvasNode.ts` paints the grid, automatic and drawn field lines, and sampled vector arrows. Field arrows point in the actual E direction; opacity and length are compressed logarithmically for display.
- `src/explore/view/ChargeNode.ts` gives charges pointer and keyboard dragging. `ExploreScreenView.ts` lays out the board, probe, controls, and reset.
- `src/i18n/strings_*.json` holds English, Spanish, and French strings. All interactive controls must retain accessible names.

## Physics notes

The ideal point-charge field is singular at a charge. `CHARGE_RADIUS` masks that disk in sampling and stops integration before singularities. Field-line density is illustrative, not a quantitative flux measurement. The field probe reports the unsaturated physical field and potential outside charge disks.

## Local reference material

- Published PhET source: `/home/veillette/totality/charges-and-fields`.
- Existing RK4 field-line fork: `/home/veillette/vgit/charges-and-fields/js/charges-and-fields/model/ElectricFieldLine.ts`.

## Validation

Run `npm run lint && npm run check && npm run build && npm test` in this directory.

## Compliance carve-outs

- **Template drift:** `prepare` guards on the local Git root. This new checkout currently has no writable member-repo `.git`, so an unguarded `npm install` would otherwise change the parent superproject hook setting.
