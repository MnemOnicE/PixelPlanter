# 🤖 AI Agent & Tool Log

This document tracks the usage of AI-powered agents and tools in the development of Pixel Planter. The goal is to maintain transparency about which parts of the project were assisted by AI, for what purpose, and which models were used.

---

## Guidelines

When using an AI tool for any development task (e.g., code generation, documentation, debugging, brainstorming), please add an entry to this log.

## Log

### **Google Gemini (Model: Gemini 1.5 Pro)**

- **Date:** 2025-09-15
- **Contributor:** Seth
- **Task:**
    - Brainstormed the core modular architecture for the project.
    - Generated initial documentation templates for `README.md`, `AGENTS.md`, `CHANGELOG.md`, `BUGS.md`, and `ROADMAP.md`.
    - Provided foundational ideas for generative algorithms (Symmetry, Perlin Noise, Cellular Automata).

### **Jules (AI Agent)**

- **Date:** 2025-11-28
- **Task:**
    - Implemented the **Asset Factory** feature (sprite sheet generation).
    - Updated `Planter.js` with `generateBatch` method.
    - Updated `UIManager.js` and `index.html` to include Asset Factory UI.
    - Fixed ESM import paths for `driver.js` and `simplex-noise` to work in browser environment.
    - Added `BatchGeneration.test.js` and verified core engine tests.
    - Updated `ROADMAP.md`.

---
### **Jules (AI Agent)**
- **Date:** 2026-06-09
- **Task:**
    - Resolved Layer Delete button UI bug in `LayerPanel.js` caused by a mismatched CSS class name.
    - Patched NaN handling within `UIManager.js` configuration parsing by defaulting size values back to standard.
    - Updated `SettingsPanel.js` config gathering to properly account for numeric parsing and defaulting.
