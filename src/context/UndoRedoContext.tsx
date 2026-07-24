import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UndoRedoAction {
  id: string;
  label: string;
  undo: () => void;
  redo: () => void;
}

interface UndoRedoContextType {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  addAction: (action: UndoRedoAction) => void;
}

const UndoRedoContext = createContext<UndoRedoContextType | undefined>(undefined);

export function UndoRedoProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<UndoRedoAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const canUndo = currentIndex > -1;
  const canRedo = currentIndex < history.length - 1;

  const undo = useCallback(() => {
    if (canUndo) {
      const action = history[currentIndex];
      action.undo();
      setCurrentIndex(currentIndex - 1);
    }
  }, [history, currentIndex, canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      const action = history[currentIndex + 1];
      action.redo();
      setCurrentIndex(currentIndex + 1);
    }
  }, [history, currentIndex, canRedo]);

  const addAction = useCallback((action: UndoRedoAction) => {
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(action);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  return (
    <UndoRedoContext.Provider value={{ canUndo, canRedo, undo, redo, addAction }}>
      {children}
    </UndoRedoContext.Provider>
  );
}

export function useUndoRedo() {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error('useUndoRedo must be used within UndoRedoProvider');
  }
  return context;
}
