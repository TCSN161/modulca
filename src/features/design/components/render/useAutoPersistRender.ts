"use client";

/**
 * BUG-ST36: every successful AI render is saved to the project at once.
 *
 * Before, a render was stored only when the user clicked "Save to
 * Presentation"; leaving the page lost it (the image lived in a blob: URL in
 * hook state). Now each new image is persisted through the single ST27 path
 * (`persistSavedRender`: JPEG ≤1024 → design store → localStorage → cloud
 * project row), for every input mode ("Ce vezi", upload, text).
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { SavedRender } from "../../store";
import { persistSavedRender } from "../../renderPersistence";

export type AutoPersistStatus =
  | { state: "idle" }
  | { state: "saving" }
  | { state: "saved"; cloud: boolean }
  | { state: "limit"; limit: number }
  | { state: "error"; message: string };

/**
 * @param imageUrl the image currently shown (blob: URL from the engine), null when none
 * @param makeRender builds the SavedRender for that image (metadata of the image shown)
 */
export function useAutoPersistRender(
  imageUrl: string | null,
  makeRender: (imageUrl: string) => SavedRender,
  projectId: string,
): { status: AutoPersistStatus; retry: () => void } {
  const [status, setStatus] = useState<AutoPersistStatus>({ state: "idle" });
  const doneFor = useRef<string | null>(null);
  const makeRef = useRef(makeRender);
  makeRef.current = makeRender;

  const persist = useCallback(async (url: string) => {
    doneFor.current = url;
    setStatus({ state: "saving" });
    const res = await persistSavedRender(makeRef.current(url), projectId);
    if (doneFor.current !== url) return; // a newer image took over
    if (res.ok) setStatus({ state: "saved", cloud: res.cloud });
    else if (res.reason === "limit") setStatus({ state: "limit", limit: res.limit });
    else setStatus({ state: "error", message: res.message });
  }, [projectId]);

  useEffect(() => {
    if (!imageUrl) {
      setStatus({ state: "idle" });
      return;
    }
    if (doneFor.current === imageUrl) return; // each image is saved once
    void persist(imageUrl);
  }, [imageUrl, persist]);

  const retry = useCallback(() => {
    if (imageUrl) void persist(imageUrl);
  }, [imageUrl, persist]);

  return { status, retry };
}
