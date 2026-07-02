import Link from "next/link";
import { cookies } from "next/headers";
import SiteHeader from "@/app/components/site-header";

export default async function NotFound() {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("site-language")?.value;
  const lang = langCookie === "pl" ? "pl" : "en";

  const copy = {
    title: lang === "pl" ? "404 — Strona nie znaleziona" : "404 — Page Not Found",
    heading: lang === "pl" ? "Nie znaleziono strony" : "Page Not Found",
    description: lang === "pl" ? "Link, który próbujesz otworzyć, jest nieprawidłowy, wygasł lub został usunięty." : "The link you are trying to open is invalid, has expired, or has been removed.",
    back: lang === "pl" ? "Powrót do strony głównej" : "Back to home",
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader showHistoryLink={false} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <h1 className="text-8xl font-extrabold text-primary sm:text-9xl">404</h1>
        <p className="mt-4 text-lg font-semibold text-muted">{copy.heading}</p>
        <p className="mt-2 text-base text-muted">{copy.description}</p>
        <Link
          href="/"
          className="mt-8 min-h-11 rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {copy.back}
        </Link>
      </main>
    </div>
  );
}
