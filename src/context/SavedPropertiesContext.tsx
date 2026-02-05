"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface SavedPropertiesContextType {
  savedIds: Set<string>;
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  count: number;
}

const SavedPropertiesContext = createContext<SavedPropertiesContextType>({
  savedIds: new Set(),
  toggleSave: () => {},
  isSaved: () => false,
  count: 0,
});

export function SavedPropertiesProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem("landscout_saved");
      if (stored) {
        setSavedIds(new Set(JSON.parse(stored)));
      }
    } catch {}
  }, []);

  const toggleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem("landscout_saved", JSON.stringify([...next]));
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  return (
    <SavedPropertiesContext.Provider
      value={{ savedIds, toggleSave, isSaved, count: savedIds.size }}
    >
      {children}
    </SavedPropertiesContext.Provider>
  );
}

export function useSavedProperties() {
  return useContext(SavedPropertiesContext);
}
