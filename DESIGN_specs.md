# Design Specifications: Usability & Functionality Enhancements

**Date:** 2025-10-26
**Target Audience:** Indie Game Developers, Pixel Artists
**Goal:** Transform Pixel Planter from a "random generator" into a precision tool for creating game-ready assets.

---

## Executive Summary

The following three feature concepts are designed to move Pixel Planter towards a "Visual Logic" and "Parameter Rich" workflow. They address the need for control, reproducibility, and production-ready output.

## 1. The Asset Factory (Batch Processing & Sprite Sheets)

### Concept
Game developers rarely need *one* rock; they need *five* variations of a rock to paint a level. The **Asset Factory** shifts the focus from "generating an image" to "generating a set."

### User Story
> "As an indie dev creating a forest level, I need 10 variations of a pine tree using my 'Forest' palette. I want to generate them all at once and download a single `.png` sprite sheet."

### UI/UX Description
*   **Batch Toggle:** A switch in the UI to enable "Factory Mode."
*   **Grid Settings:** Controls for `Rows`, `Columns`, and `Padding`.
*   **Variation Logic:** A slider for "Variance" (e.g., Low Variance keeps the shape similar but changes noise; High Variance changes the core seed completely).
*   **Export Panel:** A dedicated button to "Download Sprite Sheet" with metadata (JSON) describing the cell sizes.

### Technical Implications
*   **Planter Engine:** Needs a wrapper method `generateBatch(count, config)` that runs the generation loop multiple times with derived seeds.
*   **Canvas Stitching:** A utility to create a large canvas and draw individual generated buffers onto it.
*   **Performance:** Generation needs to be asynchronous (Web Workers) to prevent UI freezing when generating large batches (e.g., 64 variations).

---

## 2. Smart Regions (Hybrid Control & Zone Constraints)

### Concept
Pure procedural generation is often too chaotic. Pure manual drawing is too slow. **Smart Regions** bridges the gap by allowing the user to manually paint "containers" or "skeletons" that the algorithms then fill or flesh out.

### User Story
> "I want to draw the rough shape of a floating island manually, but have the 'Noise' generator automatically fill in the texture, and the 'Particle' modifier only drop grass on the top pixels of that shape."

### UI/UX Description
*   **Zone Layer Type:** A new Layer option called "Zone." These layers are not rendered in the final image but are used as inputs for others.
*   **Zone Tools:** Brush/Rect/Fill tools to draw simple shapes (e.g., a solid block of red pixels) on the Zone Layer.
*   **Constraint Selector:** In the Generator settings, a dropdown: `Limit to Zone: [Zone Layer Name]`.
*   **Context Aware Modifiers:** Modifiers like "Outline" or "Dither" can be set to apply only to specific zones or specific colors within the underlying layer.

### Technical Implications
*   **Generator API:** Generators currently create their own grid. They must be updated to accept an optional `inputMask` or `inputShape` argument to constrain their logic (e.g., `CellularAutomata` only running active cells within the mask).
*   **UI Manager:** Needs a tool palette (Brush, Eraser) for drawing on layers directly in the canvas view.

---

## 3. The Visual Modifier Pipeline (Visual Logic)

### Concept
Currently, modifiers are a simple linear list. To achieve "programmatic" control without code, we need conditional logic. This feature introduces a flow-based or advanced stack-based interface for post-processing.

### User Story
> "I want to create a 'Ruins' generator. If a pixel is 'Stone Color', I want to apply a 'Crack' pattern. If a pixel is 'Sky Color', I want to leave it transparent. Finally, I want a global 'Shadow' applied to everything."

### UI/UX Description
*   **Pipeline Editor:** A visual interface replacing the simple checklist.
*   **Logic Blocks:**
    *   **Filter:** "Select Pixels where Color == X" or "Select Pixels connected to Edge".
    *   **Action:** Apply Modifier (Noise, Outline, Shift).
    *   **Branch:** Split the flow (True/False).
*   **Node Graph (Advanced):** A "Geometry Nodes" style view for connecting these blocks.
*   **Stack View (Simple):** An ordered list with indentation to show conditionals (like Photoshop folders or coding `if` statements).

### Technical Implications
*   **Data Structure:** The `modifiers` config changes from `Array<Object>` to a Tree or Graph structure.
*   **Pixel Processing:** We need a "Selection Mask" concept that passes between nodes, determining which pixels the next modifier effects.
*   **New Modifiers:** `FilterModifier` (creates a selection), `BranchModifier` (executes children based on selection).

---

## Implementation Priority Recommendation

1.  **Asset Factory:** Highest value for Game Devs immediately. Low technical risk.
2.  **Smart Regions:** High value for control. Medium technical complexity (requires drawing tools).
3.  **Visual Pipeline:** High complexity. Best saved for a v2.0 "Pro" release.
