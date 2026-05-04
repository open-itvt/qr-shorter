import type { Metadata } from "next";
import type { Viewport } from "next";
import "./globals.css";
import {
  alternateSiteName,
  getSeoBaseUrl,
  getWebsiteJsonLd,
  siteDescription,
  siteKeywords,
  siteName,
} from "@/lib/seo";

const baseUrl = getSeoBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName,
    title: siteName,
    description: siteDescription,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: siteName,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#25af74",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = getWebsiteJsonLd(baseUrl);

  return (
    <html lang="pl" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        {/* Structured data helps Google understand the site as a Website entity. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(websiteJsonLd)}}
        />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200 px-4 py-4 text-center text-sm text-slate-400 dark:border-slate-800">
          {alternateSiteName} · (C) 2026 - Copyright iTVT Poland Group
        </footer>
      </body>
    </html>
  );
}
