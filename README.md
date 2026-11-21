# Electric Field Mapper

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)

A SceneryStack simulation for exploring electric fields created by point charges.
Inspired by PhET's *Charges and Fields* and a local field-line tracing extension.
Built with [SceneryStack](https://scenerystack.org/), Vite 8, TypeScript 7, and Biome 2.

## Features

- Add, drag, and remove positive and negative 1 nC charges, drawn as the red and blue spheres of PhET's *Charges and Fields*.
- Choose a charge configuration or build your own; optionally snap charges to the half-metre grid.
- View Coulomb field vectors and continuous electric field lines together or separately.
- Generate lines around positive and negative charges automatically in proportion to charge magnitude, or place individual line seeds anywhere on the board.
- Drag any number of electric field sensors from the box; each shows the E vector as a red arrow. Turn on **Values** to show its strength in V/m and direction in degrees. Drag them back to remove them.
- Measure distances in centimetres with the draggable measuring tape; **Values** and **Grid** show a one-metre scale arrow.
- Resize the window to reveal more field while the controls follow its edges.
- Turn on **Voltage** to colour the board by electric potential: red for positive, blue for negative.
- Drag the voltmeter out of the toolbox to read potential in V at its crosshair, and plot or erase equipotential lines. **Values** also labels those lines with their voltage.
- From Preferences, switch projector mode or language, and set the voltage-map scale, arrow lengths, field-line arrowheads and density, and field-zero markers.
- Set the opening checkboxes and charge configuration from the URL, for example `?preset=quadrupole&showVoltage=true&showVectors=false`.
- Keyboard support for adding, moving, and removing charges, sensors, the voltmeter, and the measuring tape, with named controls, localized keyboard help, and a live screen summary.
- See the [model description](doc/model.md) for the physics and numerical limits, and [implementation notes](doc/implementation-notes.md) for the architecture.

## Quick Start

```bash
npm install
npm run icons    # generate PNG icons from public/icons/icon.svg
npm start        # dev server → http://localhost:5173
```

Open the local URL shown by Vite. The initial dipole has one positive and one negative charge. Turn on **Tap to draw** and tap the board to add a line through that point, or choose **Line at voltmeter** for keyboard access after taking the voltmeter out of Tools.

To use the keyboard, Tab to a toolbox item and press Enter or Space, then move the placed item with arrows or WASD. Shift makes movement slower; snapped charges always move one half-metre grid square per step. Delete or Backspace removes the focused charge or sensor, or puts away the focused voltmeter or measuring tape. The navigation bar’s **Keyboard Shortcuts** button documents these controls.

Checkbox query parameters are `showVectors`, `showLines`, `automaticLines`, `showVoltage`, `showValues`, `showGrid`, `snapToGrid`, `drawMode`, `fieldLineArrowheads`, and `showFieldZeros`, each `true` or `false`. Preference parameters are `voltageScale` (`10`, `40`, `200`, or `auto`), `arrowScale` (`direction`, `compressed`, or `linear`), and `linesPerNanocoulomb` (`8`, `12`, `16`, or `24`). The configuration parameter `preset` is `dipole`, `likePair`, `line`, `alternatingLine`, `square`, `quadrupole`, `parallelPlates`, or `custom`. Reset All restores the opening checkboxes and configuration, clears drawn lines, and puts measuring tools away. Preferences survive Reset All.

## Scripts

| Command | Description |
|---|---|
| `npm start` / `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build → `dist/` |
| `npm run build:single` | Build a self-contained HTML file |
| `npm run preview` | Preview the production build locally |
| `npm test` | Run Vitest unit tests (includes memory-leak suite) |
| `npm run test:fuzz` | Optional Playwright fuzz smoke: pointer (`?fuzz`) + keyboard (`?fuzzBoard`), with `?ea`, 30s each |
| `npm run test:fuzz -- 90` | Same fuzz for 90 seconds (`--duration 90` or `FUZZ_DURATION=90` also work) |
| `npm run test:fuzz:quick` | Shorter fuzz smoke (10s) |
| `npm run test:fuzz:long` | Longer fuzz smoke (300s) |
| `npm run check` | TypeScript type check |
| `npm run lint` | Biome lint check |
| `npm run check:unused` / `npm run knip` | Report unused files, exports, and dependencies (manual check) |
| `npm run check:architecture` | dependency-cruiser layer and cycle rules on `src/` (manual check) |
| `npm run format` | Auto-format all files |
| `npm run fix` | Lint + auto-fix |
| `npm run icons` | Regenerate PNG icons from `public/icons/icon.svg` |
| `npm run release` | `check && lint && build && test`, then version patch + push tags |
| `npm run clean` | Remove `dist/` |

New sims start at `version: "0.0.0"` in `package.json`. Bump only when cutting a release (for example `npm version patch` and a matching git tag). Keep `name` in kebab-case; it is separate from the SceneryStack sim identifier in `src/init.ts`, which reads its `version` from `package.json`.

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [SceneryStack](https://scenerystack.org/) | ^3.0.0 | Simulation framework |
| [Vite](https://vitejs.dev/) | ^8 | Build tool + dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^7 | Type-safe JavaScript |
| [Biome](https://biomejs.dev/) | ^2.5 | Linting + formatting |
| [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | ^2 | PWA + service worker |

## License

GNU Affero General Public License v3.0 — see [OpenLyceum org license](https://github.com/OpenLyceum/.github/blob/main/LICENSE).
The PhET implementation was used as a physics reference; this repository contains a new SceneryStack implementation.

## Contributing

See [OpenLyceum contributing guidelines](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
Report bugs via GitHub Issues; use org issue templates.
