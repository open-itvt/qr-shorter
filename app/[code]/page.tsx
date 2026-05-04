import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { isLinkExpired, storage } from "@/lib/storage";
import AutoRedirect from "@/app/components/auto-redirect";
import { getSeoBaseUrl, siteName } from "@/lib/seo";

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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      {/* The metadata above is used by crawlers and social previews; browsers redirect immediately. */}
      <AutoRedirect targetUrl={link.url} lang={lang} />

      <div className="space-y-4 rounded-3xl border border-slate-200 bg-surface p-6 shadow-sm dark:border-slate-700">
        <h1 className="text-3xl font-extrabold text-primary sm:text-4xl">URL Shorter</h1>
        <p className="text-base text-muted">{lang === "pl" ? "Przekierowujemy do docelowej strony." : "Redirecting you to the target page."}</p>
        <p className="break-all text-sm text-muted">
          {lang === "pl"
            ? "Jeśli przekierowanie nie nastąpi automatycznie, otwórz"
            : "If the redirect does not happen automatically, open"}{" "}
          <a className="text-primary underline" href={link.url}>
            {link.url}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
