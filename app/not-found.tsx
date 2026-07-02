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
    action: lang === "pl" ? "Utwórz nowy skrócony link" : "Create a new short link",
    home: lang === "pl" ? "Strona główna" : "Home",
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader showHistoryLink={false} />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
        <div className="space-y-4 rounded-3xl border border-slate-200 bg-surface p-6 shadow-sm dark:border-slate-700">
          <h1 className="text-6xl font-extrabold text-primary sm:text-7xl">404</h1>
          <p className="text-lg font-semibold text-muted">{copy.heading}</p>
          <p className="text-base text-muted">{copy.description}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="min-h-11 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {copy.action}
            </Link>
            <Link
              href="/"
              className="min-h-11 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {copy.home}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
