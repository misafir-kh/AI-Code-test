import type { Metadata } from "next";
import Link from "next/link";

import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Preise",
};

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm sm:px-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Preise
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Ein Preismodell ist noch in Arbeit
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Der aktuelle MVP hat keine Abrechnung. Browser-Tests laufen lokal
            auf deinem Rechner; eine Cloud-Ausführung ist noch nicht enthalten.
          </p>
          <Link
            href="/workspace"
            className="mt-8 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
          >
            Zum Workspace
          </Link>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-slate-950">
            Funktionen im aktuellen MVP
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-950">Repositorys</h3>
              <p className="mt-2 text-sm text-slate-600">
                GitHub-Projekte verbinden und für Tests auswählen.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-950">Testgenerierung</h3>
              <p className="mt-2 text-sm text-slate-600">
                Testfälle mit Gemini aus Repository-Dateien erstellen.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold text-slate-950">Testausführung</h3>
              <p className="mt-2 text-sm text-slate-600">
                Browser-Tests lokal mit Playwright ausführen.
              </p>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
