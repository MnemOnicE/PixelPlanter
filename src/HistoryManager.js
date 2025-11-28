/**
 * @file HistoryManager.js
 * @description Manages the undo/redo stack for application state.
 */

/**
 * Manages the history of application states (Undo/Redo).
 * Uses a stack-based approach to store configuration snapshots.
 */
export class HistoryManager {
    /**
     * An array to store previous states.
     * @type {object[]}
     * @private
     */
    #historyStack = [];

    /**
     * An array to store undone states.
     * @type {object[]}
     * @private
     */
    #redoStack = [];

    /**
     * Limit how many states we store to save memory.
     * @type {number}
     * @private
     */
    #maxHistory = 20;

    /**
     * Adds a new state to the history.
     * A 'state' is the full configuration object used for generation.
     *
     * @param {object} config - The configuration object to save.
     */
    addState(config) {
        // Before adding a new state, clear the redo stack.
        this.#redoStack = [];

        // Push the new configuration onto the stack.
        this.#historyStack.push(config);

        // If the stack is too large, remove the oldest entry.
        if (this.#historyStack.length > this.#maxHistory) {
            this.#historyStack.shift(); // Removes the first element.
        }
    }

    /**
     * Returns the previous state and moves the current one to the redo stack.
     *
     * @returns {object|null} The previous configuration object or null if no history.
     */
    undo() {
        // If there's nothing to undo (or only one state), return null.
        if (this.#historyStack.length < 2) {
            return null;
        }

        // Pop the current state and move it to the redo stack.
        const currentState = this.#historyStack.pop();
        this.#redoStack.push(currentState);

        // Return the new "current" state, which is now the last on the stack.
        return this.#historyStack[this.#historyStack.length - 1];
    }

    /**
     * Returns a state from the redo stack.
     *
     * @returns {object|null} The redone configuration object or null if no redo states.
     */
    redo() {
        // If there's nothing to redo, return null.
        if (this.#redoStack.length === 0) {
            return null;
        }

        // Pop the state from the redo stack and push it back to the history.
        const stateToRedo = this.#redoStack.pop();
        this.#historyStack.push(stateToRedo);

        // Return the restored state.
        return stateToRedo;
    }
}
