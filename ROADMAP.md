# 🗺️ Project Roadmap

This document outlines the future direction and planned features for Pixel Planter. It is a living document and may change over time.

---

## Guiding Principles

-   **Modularity:** Keep the core small and allow for easy extension.
-   **Performance:** Ensure generation is fast enough for real-time use in games.
-   **Ease of Use:** Maintain a simple and intuitive API.

---

## v0.x.x - Core Engine & Foundations

-   [x] Establish core rendering engine (`Planter` class).
-   [x] Implement basic generator modules (`symmetry`, `noise`).
-   [x] Implement basic palette and exporter modules.
-   [ ] Write comprehensive unit tests for the core engine.
-   [ ] Set up a basic examples page.

## v1.0.0 - Stable Release

-   [ ] Finalize the public API.
-   [ ] Add at least 5 distinct generator modules.
-   [ ] Implement the sprite sheet stitching utility.
-   [ ] Implement the layering and opacity system.
-   [ ] Full documentation for all public methods and modules.

## Post-v1.0 - Future Features

-   [ ] Animation tools (e.g., generating frames for looping animations).
-   [ ] More exporter options (SVG, JSON data).
-   [ ] A simple browser-based UI for experimenting with generators.
-   [ ] WebGL-based renderer for improved performance with large canvases.

## Future Design Concepts

We are exploring deeper functionality for professional workflows. See `DESIGN_specs.md` for detailed specifications on:
-   **The Asset Factory:** Batch generation and sprite sheets.
-   **Smart Regions:** Zone-based generation constraints.
-   **Visual Modifier Pipeline:** Logic-based post-processing.
