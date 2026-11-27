import { notFound } from "next/navigation";
import ExpressPage from "@/features/express/ExpressPage";
import { isExpressEnabled } from "@/features/express/flag";

/** /express — ships dark: 404 unless EXPRESS_ENABLED / NEXT_PUBLIC_EXPRESS_ENABLED is on. */
export default function Page() {
  if (!isExpressEnabled()) notFound();
  return <ExpressPage />;
}
