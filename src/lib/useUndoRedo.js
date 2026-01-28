import { useState, useCallback } from 'react';

export default function useUndoRedo(initialState) {
    const [past, setPast] = useState([]);
    const [present, setPresent] = useState(initialState);
    const [future, setFuture] = useState([]);

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    const undo = useCallback(() => {
        if (!canUndo) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setPast(newPast);
        setFuture([present, ...future]);
        setPresent(previous);
    }, [past, present, future, canUndo]);

    const redo = useCallback(() => {
        if (!canRedo) return;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast([...past, present]);
        setPresent(next);
        setFuture(newFuture);
    }, [past, present, future, canRedo]);

    const set = useCallback((newPresent) => {
        if (newPresent === present) return;

        setPast([...past, present]);
        setPresent(newPresent);
        setFuture([]);
    }, [past, present]);

    // Initial load sync
    const reset = useCallback((newState) => {
        setPast([]);
        setPresent(newState);
        setFuture([]);
    }, []);

    return [present, set, undo, redo, canUndo, canRedo, reset];
}
