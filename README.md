# Pixel Planter 🌱

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/pixel-planter.svg?style=flat)](https://www.npmjs.com/package/pixel-planter) A modular, lightweight JavaScript library for creating generative pixel art. Perfect for game development, art projects, and creative coding experiments.

---

## What is Pixel Planter?

Pixel Planter is a tool designed to bring algorithmic art to your fingertips. Instead of drawing sprites by hand, you can define rules and parameters to generate unique, complex, and interesting pixel art on the fly. It's built to be highly modular and easily integrated into existing JavaScript projects, especially games.

## Features

- **Modular Engine:** Easily swap out generators, color palettes, and post-processing filters.
- **Rich Generator Library:** Includes algorithms for symmetry, noise, cellular automata, and more.
- **Palette Management:** Apply custom color schemes or use built-in classic palettes.
- **Utility Tools:** Built-in functions for creating sprite sheets, layering, and managing opacity.
- **Zero Dependencies:** Written in plain JavaScript for maximum compatibility.

## Installation

```bash
npm install pixel-planter
```

## Quick Start

Here's a simple example of how to generate a 16x16 symmetric sprite and add it to your webpage.

```javascript
import { Planter } from 'pixel-planter';

// Configure the generator
const config = {
    size: 16,
    generator: 'symmetry',
    palette: 'monochrome',
};

// Create a new planter instance
const art = new Planter(config);

// Generate the artwork and get the canvas element
const mySprite = art.generate().getCanvas();

// Add it to the body of your HTML page
document.body.appendChild(mySprite);
```

## System Architecture

### High-Level Purpose

Pixel Planter is designed as a modular, layer-based generative art engine. Its core purpose is to decouple the generation logic (algorithms) from the rendering logic (palettes) and post-processing (modifiers), allowing for infinite combinations of visual styles. The architecture follows a non-destructive workflow where each layer maintains its configuration, allowing for real-time updates and "undo" capabilities.

### Installation & Setup

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/pixel-planter.git
    cd pixel-planter
    ```

2. **Install dependencies:**

    ```bash
    npm install
    ```

3. **Run local development server:**

    ```bash
    # You can use Python's built-in server or any other static file server
    python3 -m http.server 8000
    # Open http://localhost:8000 in your browser
    ```

4. **Run tests:**
    ```bash
    npm test
    ```

### Usage Examples

**Basic Generation:**

```javascript
import { Planter } from './src/Planter.js';

const planter = new Planter({ size: 32, pixelSize: 10 });

// Add a simple noise layer
planter.addLayer({
    generator: 'noise',
    palette: 'forest',
    noiseScale: 15,
});

// Generate and append to DOM
const canvas = planter.generate().getCanvas();
document.body.appendChild(canvas);
```

**Advanced Layering with Modifiers:**

```javascript
const planter = new Planter({ size: 64, pixelSize: 5 });

// Background Layer
planter.addLayer({
    name: 'Background',
    generator: 'noise',
    palette: 'vaporwave',
});

// Foreground Layer with Modifiers
planter.addLayer({
    name: 'Structure',
    generator: 'cellular-automata',
    palette: 'monochrome',
    modifiers: [
        { name: 'outline' },
        { name: 'particle-deposition' }, // Simulates gravity
    ],
});

planter.generate();
```

### File Structure

A tree view explaining the role of each module:

- **src/**: Core source code.
    - **Planter.js**: The main engine class. Orchestrates generators, modifiers, palettes, and layer management.
    - **Layer.js**: Represents a single drawing layer. Stores configuration, grid data, and visibility state.
    - **UIManager.js**: Manages the user interface. Handles DOM events, updates controls, and manages the application lifecycle.
    - **HistoryManager.js**: Implements the Command pattern (via state snapshots) for Undo/Redo functionality.
    - **generators/**: Algorithms that create the initial binary grid data (e.g., `NoiseGenerator.js`, `SymmetryGenerator.js`).
    - **modifiers/**: Post-processing effects that alter the grid data (e.g., `OutlineModifier.js`, `PathfinderModifier.js`).
    - **palettes/**: Modules that map binary grid data to CSS colors (e.g., `VaporwavePalette.js`).
    - **patterns/**: Stores pre-defined shapes or "stamps" for the Pattern Generator.
    - **utils/**: Helper classes, primarily the Seeded PRNG.
- **tests/**: Unit and integration tests using Jest.
- **main.js**: The entry point. Initializes the `UIManager` when the DOM is ready.

## Contributing

Contributions are welcome! Please see the `ROADMAP.md` for ideas or open an issue to suggest a new feature.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
