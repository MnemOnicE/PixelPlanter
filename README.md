# Pixel Planter 🌱

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/pixel-planter.svg?style=flat)](https://www.npmjs.com/package/pixel-planter) A modular, lightweight JavaScript library for creating generative pixel art. Perfect for game development, art projects, and creative coding experiments.



---

## What is Pixel Planter?

Pixel Planter is a tool designed to bring algorithmic art to your fingertips. Instead of drawing sprites by hand, you can define rules and parameters to generate unique, complex, and interesting pixel art on the fly. It's built to be highly modular and easily integrated into existing JavaScript projects, especially games.

## Features

-   **Modular Engine:** Easily swap out generators, color palettes, and post-processing filters.
-   **Rich Generator Library:** Includes algorithms for symmetry, noise, cellular automata, and more.
-   **Palette Management:** Apply custom color schemes or use built-in classic palettes.
-   **Utility Tools:** Built-in functions for creating sprite sheets, layering, and managing opacity.
-   **Zero Dependencies:** Written in plain JavaScript for maximum compatibility.

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
    palette: 'monochrome'
};

// Create a new planter instance
const art = new Planter(config);

// Generate the artwork and get the canvas element
const mySprite = art.generate().getCanvas();

// Add it to the body of your HTML page
document.body.appendChild(mySprite);
```

## Contributing

Contributions are welcome! Please see the `ROADMAP.md` for ideas or open an issue to suggest a new feature.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
