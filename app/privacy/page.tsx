import type { Metadata } from "next";
import PrivacyPolicyClient from "@/app/components/privacy-policy-client";
import { siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Privacy Policy | ${siteName}`,
  description: "Privacy policy for QR Shorter.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return <PrivacyPolicyClient />;
}
