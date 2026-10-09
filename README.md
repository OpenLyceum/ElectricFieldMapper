# Electric Field Mapper

A SceneryStack simulation for exploring electric fields created by point charges. Inspired by PhET's *Charges and Fields* and a local field-line tracing extension.

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

Requires Node 24 or later.

```bash
npm install
npm start
```

Open the local URL shown by Vite. The initial dipole has one positive and one negative charge. Turn on **Tap to draw** and tap the board to add a line through that point, or choose **Line at voltmeter** for keyboard access after taking the voltmeter out of Tools.

To use the keyboard, Tab to a toolbox item and press Enter or Space, then move the placed item with arrows or WASD. Shift makes movement slower; snapped charges always move one half-metre grid square per step. Delete or Backspace removes the focused charge or sensor, or puts away the focused voltmeter or measuring tape. The navigation bar’s **Keyboard Shortcuts** button documents these controls.

Checkbox query parameters are `showVectors`, `showLines`, `automaticLines`, `showVoltage`, `showValues`, `showGrid`, `snapToGrid`, `drawMode`, `fieldLineArrowheads`, and `showFieldZeros`, each `true` or `false`. Preference parameters are `voltageScale` (`10`, `40`, `200`, or `auto`), `arrowScale` (`direction`, `compressed`, or `linear`), and `linesPerNanocoulomb` (`8`, `12`, `16`, or `24`). The configuration parameter `preset` is `dipole`, `likePair`, `line`, `alternatingLine`, `square`, `quadrupole`, `parallelPlates`, or `custom`. Reset All restores the opening checkboxes and configuration, clears drawn lines, and puts measuring tools away. Preferences survive Reset All.

## Scripts

| Command | Purpose |
|---|---|
| `npm start` | Start the development server |
| `npm run check` | Type check app, scripts, and tests |
| `npm run lint` | Check style with Biome |
| `npm test` | Run model, physics, and disposal tests |
| `npm run test:fuzz:quick` | Run pointer and keyboard browser fuzz checks |
| `npx playwright test tests/browser` | Run keyboard and preference browser regressions |
| `npm run build` | Build the installable web app into `dist/` |
| `npm run build:single` | Build a self-contained HTML file |
| `npm run preview` | Serve the production build locally |

## Tech Stack

SceneryStack 3, TypeScript 7, Vite 8, Biome 2, Vitest 5, Playwright 1, and vite-plugin-pwa 2 (declared in `package.json`). The simulation uses SceneryStack's screen, scene graph, input, localization, accessibility, and color profile systems.

## License

AGPL-3.0-or-later. See the [OpenLyceum organization license](https://github.com/OpenLyceum/.github/blob/main/LICENSE). The PhET implementation was used as a physics reference; this repository contains a new SceneryStack implementation.

## Contributing

See the [OpenLyceum contributing guide](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
