export const siteName = "QR Shorter";
export const alternateSiteName = "URL Shorter";
export const siteDescription = "Shorten links, generate QR codes, and track click and scan statistics.";
export const siteKeywords = [
  "URL shortener",
  "QR code generator",
  "link shortener",
  "redirect tracking",
  "click analytics",
  "QR Shorter",
];

function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "";
  }

  const candidate =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    return parsed.origin;
  } catch {
    return "";
  }
}

export function getSeoBaseUrl(): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  if (configuredBaseUrl) {
    const normalized = normalizeBaseUrl(configuredBaseUrl);
    if (normalized) {
      return normalized;
    }
  }

  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercelProductionUrl) {
    const normalized = normalizeBaseUrl(vercelProductionUrl);
    if (normalized) {
      return normalized;
    }
  }

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    const normalized = normalizeBaseUrl(vercelUrl);
    if (normalized) {
      return normalized;
    }
  }

  return "http://localhost:3000";
}

export function getWebsiteJsonLd(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Website",
    name: siteName,
    url: baseUrl,
    alternateName: alternateSiteName,
  };
}
