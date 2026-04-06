"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Project overview — redirects to the land designer (Step 1).
 * In the future this can show a project summary dashboard.
 */
export default function ProjectPage() {
  const router = useRouter();

  useEffect(() => {
    // For now, redirect to the first step
    router.replace("/project/demo/land");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-teal-800 border-t-transparent" />
    </div>
  );
}
