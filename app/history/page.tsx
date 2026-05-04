import type { Metadata } from "next";
import HistoryPageClient from "@/app/components/history-page-client";
import { siteDescription, siteName } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Historia | ${siteName}`,
  description: siteDescription,
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/history",
  },
};

export default function HistoryPage() {
  return <HistoryPageClient />;
}
