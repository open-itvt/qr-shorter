import type { Metadata } from "next";
import HomePageClient from "@/app/components/home-page-client";
import { siteDescription, siteKeywords, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: "URL Shortener, QR Code Generator & Link Statistics | QR Shorter",
  description:
    "Shorten long URLs, generate QR codes, and track link clicks and scan statistics with QR Shorter, a fast and privacy-conscious URL shortener.",
  keywords: siteKeywords,
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return <HomePageClient />;
}
