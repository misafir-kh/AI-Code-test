import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const { isAuthenticated } = await auth();

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold tracking-tight">
            AI Code <span className="text-blue-400">Test</span>
          </Link>

          <nav aria-label="Hauptnavigation" className="flex items-center gap-6">
            <Link href="/pricing" className="hidden text-sm text-slate-300 hover:text-white sm:inline">
              Pricing
            </Link>
            <Link href="/support" className="hidden text-sm text-slate-300 hover:text-white sm:inline">
              Support
            </Link>

            {isAuthenticated ? (
              <Link
                href="/workspace"
                className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold hover:bg-blue-400"
              >
                Zum Workspace
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm font-medium text-slate-300 hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold hover:bg-blue-400"
                >
                  Registrieren
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center lg:py-32">
        <div>
          <p className="mb-6 inline-flex rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
            GitHub-Projekte für automatisierte Tests vorbereiten
          </p>

          <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Bessere Tests beginnen mit einem klaren Überblick.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Verbinde ein GitHub-Repository und bereite dein Projekt für
            KI-gestützte Tests vor. Die Plattform befindet sich noch in
            Entwicklung – Testgenerierung und Browser-Ausführung sind geplant.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href={isAuthenticated ? "/workspace" : "/sign-up"}
              className="rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-400"
            >
              {isAuthenticated ? "Workspace öffnen" : "Jetzt registrieren"}
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10"
            >
              Mehr erfahren
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-blue-950/30">
          <p className="text-sm font-medium text-slate-400">So einfach läuft es ab: 
          </p>

          <ol className="mt-6 space-y-4">
            {[
              ["01", "GitHub verbinden", "Repository für dein Projekt auswählen"],
              ["02", "Projekt vorbereiten", "Ziel und Testanforderungen festlegen"],
              ["03", "Tests entwickeln", "KI-Testgenerierung und Ausführung sind geplant"],
            ].map(([number, title, description]) => (
              <li
                key={number}
                className="flex gap-4 rounded-xl border border-white/10 bg-slate-900/80 p-4"
              >
                <span className="font-mono text-blue-300">{number}</span>
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="mt-1 text-sm text-slate-400">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-400 sm:flex-row sm:justify-between">
          <span>AI Code Test</span>
          <span>Ein Projekt in Entwicklung</span>
        </div>
      </footer>
    </main>
  );
}