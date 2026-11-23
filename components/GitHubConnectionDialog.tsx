"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ConnectionStatus = {
  connected: boolean;
  login?: string;
  error?: string;
};

export default function GitHubConnectionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [error, setError] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/github/status", {
        cache: "no-store",
      });
      const result: ConnectionStatus = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "GitHub-Status konnte nicht geladen werden.");
      }

      setStatus(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "GitHub-Status konnte nicht geladen werden."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function disconnect() {
    setIsDisconnecting(true);
    setError("");

    try {
      const response = await fetch("/api/github/disconnect", {
        method: "DELETE",
      });
      const result: { error?: string } = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "GitHub konnte nicht getrennt werden.");
      }

      setStatus({ connected: false });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "GitHub konnte nicht getrennt werden."
      );
    } finally {
      setIsDisconnecting(false);
    }
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const result = url.searchParams.get("github");

    if (!result) {
      queueMicrotask(() => void loadStatus());
      return;
    }

    url.searchParams.delete("github");
    window.history.replaceState({}, "", url);

    queueMicrotask(() => {
      setIsOpen(true);

      if (result === "configuration-error") {
        setStatus({ connected: false });
        setError(
          "Die GitHub-OAuth-Konfiguration fehlt. Bitte prüfe die Server-Einstellungen."
        );
      } else if (result !== "connected") {
        setStatus({ connected: false });
        setError(
          "Die GitHub-Verbindung konnte nicht hergestellt werden. Bitte versuche es erneut."
        );
      } else {
        void loadStatus();
      }
    });
  }, [loadStatus]);

  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        !popoverRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDisconnecting) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDisconnecting, isOpen]);

  return (
    <div ref={popoverRef} className="relative">
      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
          } else {
            setIsOpen(true);
            void loadStatus();
          }
        }}
        aria-label={
          status?.connected
            ? `GitHub-Profil @${status.login} öffnen`
            : "GitHub-Verbindung verwalten"
        }
        aria-haspopup="dialog"
        aria-controls="github-profile-popover"
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
            clipRule="evenodd"
          />
        </svg>
        <span className="max-w-28 truncate">
          {status?.connected ? `@${status.login}` : "GitHub"}
        </span>
      </button>

      {isOpen && (
        <section
          id="github-profile-popover"
          role="dialog"
          aria-label="GitHub-Profil und Verbindung"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-800">
              <svg
                className="size-6"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-950">GitHub</p>
              <p className="truncate text-xs text-slate-500">
                {isLoading
                  ? "Verbindung wird geprüft …"
                  : status === null
                    ? "Status nicht verfügbar"
                    : status.connected
                    ? `Verbunden als @${status.login}`
                    : "Kein Konto verbunden"}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <a
              href="https://github.com/logout"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (status?.connected) {
                  void disconnect();
                }
              }}
              className="inline-flex text-sm font-semibold text-slate-800 underline decoration-slate-300 underline-offset-2 hover:text-blue-700"
            >
              GitHub-Konto wechseln
              <span className="ml-1" aria-hidden="true">
                ↗
              </span>
            </a>
          </div>

          {status?.connected ? (
            <button
              type="button"
              onClick={disconnect}
              disabled={isDisconnecting || isLoading}
              className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {isDisconnecting
                ? "Verbindung wird getrennt …"
                : "App-Verbindung trennen"}
            </button>
          ) : status === null ? (
            <button
              type="button"
              onClick={() => void loadStatus()}
              disabled={isLoading}
              className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {isLoading ? "Wird geprüft …" : "Status erneut prüfen"}
            </button>
          ) : (
            <a
              href="/api/github"
              className="mt-3 block rounded-lg bg-slate-950 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-slate-800"
            >
              Mit GitHub verbinden
            </a>
          )}

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
