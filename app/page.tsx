import type { Metadata } from "next";
import HomePageClient from "@/app/components/home-page-client";
import { siteDescription, siteKeywords, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "URL Shortener & QR Code Generator",
  description: siteDescription,
  keywords: siteKeywords,
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
