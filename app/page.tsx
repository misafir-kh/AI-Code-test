import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default async function Home() {
  const { isAuthenticated } = await auth();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SiteHeader />

      <main className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:items-center lg:py-32">
        <div>
          <p className="mb-6 inline-flex rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-200">
            KI-Testplattform für deine GitHub-Projekte
          </p>

          <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Bessere Tests beginnen mit einem klaren Überblick.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Verbinde ein GitHub-Repository, erstelle mit Gemini strukturierte
            Testfälle und führe sie lokal mit Playwright im Browser aus.
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
              Preise &amp; Funktionen
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
              ["03", "Tests ausführen", "Ergebnisse und Logs direkt im Workspace sehen"],
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
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-400 sm:flex-row sm:justify-between">
          <span>AI Code Test</span>
          <span>Lokaler MVP – Cloud-Ausführung folgt später</span>
        </div>
      </footer>
    </div>
  );
}