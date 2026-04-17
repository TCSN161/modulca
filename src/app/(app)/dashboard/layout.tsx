import type { Metadata } from "next";
import { SITE_URL } from "@/shared/lib/schema";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Manage your ModulCA projects, AI renders, and account settings.",
  alternates: { canonical: `${SITE_URL}/dashboard` },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
