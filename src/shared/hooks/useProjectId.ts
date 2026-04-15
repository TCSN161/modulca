"use client";

import { useParams } from "next/navigation";

/**
 * Returns the current project ID from the URL.
 * Falls back to "demo" when used outside a /project/[id]/ route.
 *
 * Usage:
 *   const projectId = useProjectId();
 *   <Link href={`/project/${projectId}/land`}>
 */
export function useProjectId(): string {
  const params = useParams();
  const id = params?.id;
  if (typeof id === "string" && id.length > 0) return id;
  return "demo";
}
