import type { Metadata } from "next";
import AuthForm from "@/features/auth/components/AuthForm";
import { SITE_URL } from "@/shared/lib/schema";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Start designing your modular home for free. New accounts get 3 months of Premium features during the ModulCA Beta launch.",
  alternates: { canonical: `${SITE_URL}/register` },
  openGraph: {
    title: "Start designing free — ModulCA",
    description:
      "Create a free account. 3 months of Premium included during Beta. Design modular homes with AI renders, 3D walkthroughs, and cost estimates.",
    url: `${SITE_URL}/register`,
    images: [
      {
        url: "/og?title=Start+Designing+Free&subtitle=3+months+of+Premium+included+during+Beta",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Start designing free — ModulCA",
    description:
      "Create a free account. 3 months of Premium included during Beta.",
    images: [
      "/og?title=Start+Designing+Free&subtitle=3+months+of+Premium+included+during+Beta",
    ],
  },
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
