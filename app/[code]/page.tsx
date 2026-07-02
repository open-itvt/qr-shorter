import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import AutoRedirect from "@/app/components/auto-redirect";
import SiteHeader from "@/app/components/site-header";
import { getSeoBaseUrl, siteName } from "@/lib/seo";
import { isLinkExpired, storage } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

async function loadLink(code: string) {
  const link = await storage.getByCode(code);

  if (!link || isLinkExpired(link)) {
    notFound();
  }

  return link;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const link = await loadLink(code);
  const baseUrl = getSeoBaseUrl();
  const shortUrl = `${baseUrl}/${code}`;

  return {
    title: `URL Shorter - ${link.url}`,
    description: "Redirect to other page",
    robots: {
      index: false,
      follow: false,
    },
    openGraph: {
      type: "website",
      siteName,
      title: `URL Shorter - ${link.url}`,
      description: "Redirect to other page",
      url: shortUrl,
    },
    twitter: {
      card: "summary",
      title: `URL Shorter - ${link.url}`,
      description: "Redirect to other page",
    },
    alternates: {
      canonical: shortUrl,
    },
  };
}

function getClientIp(headerStore: Headers): string | null {
  const forwardedFor = headerStore.get("x-forwarded-for");
  if (!forwardedFor) {
    return null;
  }
  return forwardedFor.split(",")[0]?.trim() ?? null;
}

export default async function ShortCodePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ src?: string }>;
}) {
  const { code } = await params;
  const { src } = await searchParams;
  const link = await storage.getByCode(code);
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("site-language")?.value;
  const lang = langCookie === "pl" ? "pl" : "en";

  if (!link || isLinkExpired(link)) {
    notFound();
  }

  const headerStore = await headers();
  const isQrScan = src === "qr";

  await storage.recordRedirect(code, {
    type: isQrScan ? "qr_scan" : "redirect",
    ip: getClientIp(headerStore),
    userAgent: headerStore.get("user-agent"),
    referer: headerStore.get("referer"),
  });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader showHistoryLink={false} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        {/* The metadata above is used by crawlers and social previews; browsers redirect immediately. */}
        <AutoRedirect targetUrl={link.url} message={link.message} lang={lang} />
      </main>
    </div>
  );
}