import type { Metadata } from "next";
import type { Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import {
  getSeoBaseUrl,
  getOrganizationJsonLd,
  getWebsiteJsonLd,
  siteDescription,
  siteKeywords,
  siteName,
} from "@/lib/seo";
import { cookies } from "next/headers";

const baseUrl = getSeoBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "URL Shortener & QR Code Generator",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteJsonLd = getWebsiteJsonLd(baseUrl);
  const organizationJsonLd = getOrganizationJsonLd(baseUrl);

  const cookieStore = await cookies();
  const langCookie = cookieStore.get("site-language")?.value ?? null;
  const htmlLang = langCookie === "en" || langCookie === "pl" ? langCookie : "pl";
  const footerLabels = htmlLang === "pl"
    ? {
        privacy: "Polityka prywatności",
        copyright: "© 2026 QR Shorter. Wszystkie prawa zastrzeżone.",
      }
    : {
        privacy: "Privacy Policy",
        copyright: "© 2026 QR Shorter. All rights reserved.",
      };

  return (
    <html lang={htmlLang} className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        {/* Structured data helps Google understand the site as a Website entity. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200 px-4 py-4 text-center text-sm text-slate-400 dark:border-slate-800">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 sm:flex-row sm:justify-between">
            <span>{footerLabels.copyright}</span>
            <Link href="/privacy" className="font-medium text-primary transition hover:underline">
              {footerLabels.privacy}
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
