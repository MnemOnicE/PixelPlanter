/**
 * @file HistoryManager.test.js
 * @description Unit tests for the HistoryManager class.
 */
import { HistoryManager } from '../src/HistoryManager.js';

describe('HistoryManager', () => {
    let history;

    beforeEach(() => {
        history = new HistoryManager();
    });

    it('should add states', () => {
        history.addState({ id: 1 });
        // The current state is just the last added one. HistoryManager doesn't expose getCurrentState()
        // but undo returns previous.
        // We need at least 2 states to undo to get back the first one.
        history.addState({ id: 2 });
        expect(history.undo()).toEqual({ id: 1 });
    });

    it('should undo and redo', () => {
        history.addState({ id: 1 });
        history.addState({ id: 2 });
        history.addState({ id: 3 });

        const undo1 = history.undo(); // Returns state 2
        expect(undo1).toEqual({ id: 2 });

        const undo2 = history.undo(); // Returns state 1
        expect(undo2).toEqual({ id: 1 });

        const redo1 = history.redo(); // Returns state 2
        expect(redo1).toEqual({ id: 2 });

        const redo2 = history.redo(); // Returns state 3
        expect(redo2).toEqual({ id: 3 });

        expect(history.redo()).toBeNull();
    });

    it('should clear redo stack on new addState', () => {
        history.addState({ id: 1 });
        history.addState({ id: 2 });
        history.undo(); // Back to 1
        history.addState({ id: 3 });

        expect(history.redo()).toBeNull();
        expect(history.undo()).toEqual({ id: 1 });
    });
});
