export const siteName = "QR Shorter";
export const alternateSiteName = "URL Shorter";
export const siteDescription = "Shorten links, generate QR codes, and track click and scan statistics with a fast, privacy-conscious URL shortener.";
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

  return "https://go.itvt.xyz";
}

export function getWebsiteJsonLd(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Website",
    "@id": `${baseUrl}/#website`,
    name: siteName,
    url: baseUrl,
    alternateName: alternateSiteName,
    description: siteDescription,
    inLanguage: ["en", "pl"],
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
  };
}

export function getOrganizationJsonLd(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    name: siteName,
    alternateName: alternateSiteName,
    url: baseUrl,
    description: siteDescription,
    sameAs: [],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        availableLanguage: ["en", "pl"],
        email: "gdpr@itvt.xyz",
      },
    ],
  };
}
