import type { Metadata } from "next";
import AuthForm from "@/features/auth/components/AuthForm";
import { SITE_URL } from "@/shared/lib/schema";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to ModulCA to continue designing your modular home. Access your projects, AI renders, and technical drawings.",
  alternates: { canonical: `${SITE_URL}/login` },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Sign In — ModulCA",
    description: "Sign in to continue designing your modular home.",
    url: `${SITE_URL}/login`,
    images: [
      {
        url: "/og?title=Sign+In&subtitle=Continue+designing+your+modular+home",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
