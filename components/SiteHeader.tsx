import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import GitHubConnectionDialog from "@/components/GitHubConnectionDialog";

export default async function SiteHeader() {
  const { isAuthenticated } = await auth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 text-lg font-bold tracking-tight text-slate-950"
        >
          AI Code <span className="text-blue-700">Test</span>
        </Link>

        <nav
          aria-label="Hauptnavigation"
          className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex"
        >
          <Link className="hover:text-blue-700" href="/">
            Startseite
          </Link>
          <Link className="hover:text-blue-700" href="/workspace">
            Workspace
          </Link>
          <Link className="hover:text-blue-700" href="/pricing">
            Preise
          </Link>
          <Link className="hover:text-blue-700" href="/support">
            Hilfe
          </Link>
        </nav>

        <details className="relative sm:hidden">
          <summary className="cursor-pointer list-none rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
            Menü
          </summary>
          <nav
            aria-label="Mobile Navigation"
            className="absolute right-0 top-12 z-40 grid min-w-44 gap-1 rounded-xl border border-slate-200 bg-white p-2 text-sm font-medium text-slate-700 shadow-lg"
          >
            <Link className="rounded-lg px-3 py-2 hover:bg-slate-50" href="/">
              Startseite
            </Link>
            <Link
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
              href="/workspace"
            >
              Workspace
            </Link>
            <Link
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
              href="/pricing"
            >
              Preise
            </Link>
            <Link
              className="rounded-lg px-3 py-2 hover:bg-slate-50"
              href="/support"
            >
              Hilfe
            </Link>
          </nav>
        </details>

        <div className="flex shrink-0 items-center gap-3">
          {isAuthenticated ? (
            <>
              <GitHubConnectionDialog />
              <UserButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden text-sm font-medium text-slate-600 hover:text-blue-700 sm:inline"
              >
                Anmelden
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Registrieren
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
