import type { Metadata } from "next";
import Link from "next/link";

import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Hilfe",
};

export default function SupportPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
            Hilfe
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
            Wie können wir helfen?
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Schreibe uns eine E-Mail an{" "}
            <a
              href="mailto:musaferjasem@gmail.com"
              className="text-blue-700 hover:underline"
            >
              musaferjasem@gmail.com
            </a>
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
            Fragen, Fehlerberichte und Verbesserungsvorschläge sind willkommen.
          </p>
          <Link
            href="/workspace"
            className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
          >
            Workspace öffnen
          </Link>
        </section>
      </main>
    </>
  );
}
