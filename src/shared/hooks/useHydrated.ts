import { useState, useEffect } from "react";

/**
 * Returns `true` only after the component has mounted on the client.
 *
 * Use this to guard store-derived values that come from localStorage
 * (e.g. Zustand persisted state). On the server the store is empty,
 * but on the client it hydrates from localStorage *before* React renders,
 * causing an SSR/client mismatch (e.g. "0" vs "27").
 *
 * Pattern:
 *   const hydrated = useHydrated();
 *   <span>{hydrated ? stats.totalModules : 0}</span>
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return hydrated;
}
