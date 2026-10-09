# Electric Field Mapper

A SceneryStack simulation for exploring electric fields created by point charges. Inspired by PhET's *Charges and Fields* and a local field-line tracing extension.

## Features

- Add, drag, and remove positive and negative 1 nC charges.
- View Coulomb field vectors and continuous electric field lines together or separately.
- Generate lines around positive charges automatically, or place individual line seeds anywhere on the board.
- Move a probe to read field strength in V/m and electric potential in V.
- Toggle the grid and use projector mode, French, or Spanish from Preferences.
- Keyboard support for charge and probe dragging, named controls, and a live screen summary.

## Quick Start

Requires Node 24 or later.

```bash
npm install
npm start
```

Open the local URL shown by Vite. The initial dipole has one positive and one negative charge. Turn on **Tap to draw** and tap the board to add a line through that point, or choose **Line at probe** for keyboard access.

## Scripts

| Command | Purpose |
|---|---|
| `npm start` | Start the development server |
| `npm run check` | Type check app, scripts, and tests |
| `npm run lint` | Check style with Biome |
| `npm test` | Run physics and template tests |
| `npm run build` | Build the installable web app |

## Tech Stack

SceneryStack 3, TypeScript 7, Vite 8, Biome 2, and Vitest 5. The simulation uses SceneryStack's screen, scene graph, input, localization, accessibility, and color profile systems.

## License

AGPL-3.0-or-later. See the [OpenLyceum organization license](https://github.com/OpenLyceum/.github/blob/main/LICENSE). The PhET implementation was used as a physics reference; this repository contains a new SceneryStack implementation.

## Contributing

See the [OpenLyceum contributing guide](https://github.com/OpenLyceum/.github/blob/main/CONTRIBUTING.md).
