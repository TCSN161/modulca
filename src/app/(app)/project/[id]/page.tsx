"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

/**
 * Project overview — redirects to the land designer (Step 1).
 * In the future this can show a project summary dashboard.
 */
export default function ProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = typeof params?.id === "string" ? params.id : "demo";

  useEffect(() => {
    // For now, redirect to the first step
    router.replace(`/project/${projectId}/choose`);
  }, [router, projectId]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-teal-800 border-t-transparent" />
    </div>
  );
}
