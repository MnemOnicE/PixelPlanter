# Known Bugs & Issues

This document lists known bugs that have been reported or discovered. For a more detailed, real-time view of all issues, please refer to the [GitHub Issues](https://github.com/your-username/pixel-planter/issues) tab.

---

| ID   | Description                                                                                     | Status       | Priority | Workaround / Notes |
| ---- | ----------------------------------------------------------------------------------------------- | ------------ | -------- | ------------------ |
| B001 | The 'Cellular Automata' generator occasionally produces an empty canvas on sizes less than 8x8. | **Resolved** | Medium   | Fixed in PR #...   |
| B002 | The Delete Layer button is unresponsive.                                                        | **Resolved** | High     | Fixed class name mismatch. |
| B003 | Setting size to empty causes NaN generator crashes.                                             | **Resolved** | High     | Fixed value fallback logic in SettingPanel and UIManager. |
