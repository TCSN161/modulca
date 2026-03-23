"use client";

import { useState, useCallback, useRef } from "react";
import { useDesignStore } from "../store";

/**
 * Hook that provides save-button state and handler.
 * Returns { saved, handleSave } where:
 *  - saved: boolean — true for 2 s after a successful save
 *  - handleSave: () => void — triggers persist + visual feedback
 */
export function useSaveDesign() {
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveToLocalStorage = useDesignStore((s) => s.saveToLocalStorage);

  const handleSave = useCallback(() => {
    saveToLocalStorage();
    setSaved(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setSaved(false), 2000);
  }, [saveToLocalStorage]);

  return { saved, handleSave } as const;
}
