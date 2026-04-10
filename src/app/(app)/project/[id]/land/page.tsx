import { Suspense } from "react";
import LandDesigner from "@/features/land/components/LandDesigner";

export default function LandPage() {
  return (
    <Suspense>
      <LandDesigner />
    </Suspense>
  );
}
