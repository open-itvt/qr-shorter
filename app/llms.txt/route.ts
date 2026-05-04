import { getSeoBaseUrl, siteDescription, siteName } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const baseUrl = getSeoBaseUrl();
  const body = `# ${siteName}

> ${siteDescription}

## What this site does

- Shortens URLs into shareable codes.
- Generates QR codes for each short link.
- Shows redirect and scan statistics.
- Supports Polish and English.

## Important pages

- ${baseUrl}/
- ${baseUrl}/history
- ${baseUrl}/privacy
- ${baseUrl}/stats/{publicId}
- ${baseUrl}/{code}

## Notes for automated consumers

- No third-party analytics platform is required.
- Public stats are available only through the app's own endpoints.
- Sitemap: ${baseUrl}/sitemap.xml
- Robots: ${baseUrl}/robots.txt

## Contact

Use the privacy page for site operator details.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}