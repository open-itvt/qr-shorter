import type { Metadata } from "next";
import Image from "next/image";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getBaseUrl } from "@/lib/base-url";
import { storage } from "@/lib/storage";
import SiteHeader from "@/app/components/site-header";
import LocalizedCopyableLinkRow from "@/app/components/localized-copyable-link-row";
import pl from "@/locales/pl.json";
import { siteDescription, siteName } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const stats = await storage.getStatsByPublicId(publicId);

  return {
    title: stats ? `Statystyki ${stats.code} | ${siteName}` : `Statystyki | ${siteName}`,
    description: siteDescription,
    robots: {
      index: false,
      follow: false,
    },
    alternates: {
      canonical: stats ? `/stats/${stats.publicId}` : "/stats",
    },
  };
}

export default async function StatsDetailsPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const stats = await storage.getStatsByPublicId(publicId);
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("site-language")?.value;
  const lang = langCookie === "pl" ? "pl" : "en";

  if (!stats) {
    notFound();
  }

  const baseUrl = await getBaseUrl();
  const shortUrl = `${baseUrl}/${stats.code}`;
  const statsUrl = `${baseUrl}/stats/${stats.publicId}`;
  const qrDownloadUrl = `/api/qr/${stats.code}?format=jpg&download=1`;
  const copyText = lang === "pl" ? "Kopiuj" : "Copy";
  const copiedText = lang === "pl" ? "Skopiowano" : "Copied";
  const copySuccessShort = lang === "pl" ? "Link skrócony został skopiowany do schowka." : "Short link copied to clipboard.";
  const copySuccessOriginal = lang === "pl" ? "Oryginalny adres skopiowany do schowka." : "Original URL copied to clipboard.";
  const copySuccessStats = lang === "pl" ? "Adres statystyk skopiowany do schowka." : "Stats URL copied to clipboard.";
  const copyError = lang === "pl" ? "Nie udało się skopiować linku." : "Could not copy the link.";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6">
      <SiteHeader />

      <section className="space-y-4 text-center">
        <h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">
          <span className="text-primary">{lang === "pl" ? pl.stats.linkDetailsPrefix : "Link"}</span>{" "}
          {lang === "pl" ? pl.stats.linkDetailsSuffix : "details"}
        </h1>
        <p className="mx-auto max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-9">
          {lang === "pl" ? pl.stats.subtitle : "Details and statistics for this short link."}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-surface p-4 text-left shadow-sm sm:p-6 dark:border-slate-700">
          <h2 className="mb-4 text-xl font-bold">{lang === "pl" ? "Szczegóły przekierowania" : "Redirect details"}</h2>
          <div className="space-y-3 text-sm">
            <LocalizedCopyableLinkRow
              enLabel="Short link:"
              plLabel={pl.copy.shortLink}
              enCopyLabel="short link"
              plCopyLabel={pl.copy.shortLink}
              enCopyText={copyText}
              plCopyText={copyText}
              enCopiedText={copiedText}
              plCopiedText={copiedText}
              enCopySuccessMessage={copySuccessShort}
              plCopySuccessMessage={copySuccessShort}
              enCopyErrorMessage={copyError}
              plCopyErrorMessage={copyError}
              value={shortUrl}
              href={shortUrl}
            />
            <LocalizedCopyableLinkRow
              enLabel="Original URL:"
              plLabel={pl.copy.originalUrl}
              plCopyLabel={pl.copy.originalUrl}
              enCopyText={copyText}
              plCopyText={copyText}
              enCopiedText={copiedText}
              plCopiedText={copiedText}
              enCopySuccessMessage={copySuccessOriginal}
              plCopySuccessMessage={copySuccessOriginal}
              enCopyErrorMessage={copyError}
              plCopyErrorMessage={copyError}
              value={stats.url}
            />
            <LocalizedCopyableLinkRow
              enLabel="Stats URL:"
              plLabel={pl.copy.statsUrl}
              plCopyLabel={pl.copy.statsUrl}
              enCopyText={copyText}
              plCopyText={copyText}
              enCopiedText={copiedText}
              plCopiedText={copiedText}
              enCopySuccessMessage={copySuccessStats}
              plCopySuccessMessage={copySuccessStats}
              enCopyErrorMessage={copyError}
              plCopyErrorMessage={copyError}
              value={statsUrl}
              href={statsUrl}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-surface p-4 text-center shadow-sm sm:p-6 dark:border-slate-700">
          <h2 className="mb-4 text-xl font-bold">
            {lang === "pl" ? pl.stats.qrCode : "QR code"}
          </h2>
          <Image
            src={`/api/qr/${stats.code}`}
            alt={lang === "pl" ? `Kod QR dla ${shortUrl}` : `QR code for ${shortUrl}`}
            width={224}
            height={224}
            unoptimized
            className="mx-auto h-auto w-full max-w-56 rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-700"
          />
          <a
            href={qrDownloadUrl}
            download={`qr-${stats.code}.jpg`}
            className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {lang === "pl" ? pl.stats.downloadQr : "Download QR (JPG)"}
          </a>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-surface p-4 text-left shadow-sm sm:p-6 dark:border-slate-700">
        <h2 className="mb-4 text-xl font-bold">
          {lang === "pl" ? pl.stats.statistics : "Statistics"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <p>
            <span className="font-semibold">
              {lang === "pl" ? pl.stats.redirects : "Redirects:"}
            </span>{" "}
            {stats.totalClicks}
          </p>
          <p>
            <span className="font-semibold">
              {lang === "pl" ? pl.stats.qrScans : "QR scans:"}
            </span>{" "}
            {stats.qrScans}
          </p>
          <p>
            <span className="font-semibold">
              {lang === "pl" ? pl.stats.created : "Created:"}
            </span>{" "}
            {new Date(stats.createdAt).toLocaleString()}
          </p>
          <p>
            <span className="font-semibold">
              {lang === "pl" ? pl.stats.lastAccessed : "Last accessed:"}
            </span>{" "}
            {stats.lastAccessedAt ? new Date(stats.lastAccessedAt).toLocaleString() : lang === "pl" ? pl.stats.never : "Never"}
          </p>
          <p>
            <span className="font-semibold">{lang === "pl" ? "Kod:" : "Code:"}</span> {stats.code}
          </p>
        </div>
      </section>
    </main>
  );
}
