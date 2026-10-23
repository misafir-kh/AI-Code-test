'use client';

import React, { useEffect, useState } from 'react';

// Struktur eines GitHub-Repositories
interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  private: boolean;
  html_url: string;
}

// Struktur eines gespeicherten Repositorys aus der Datenbank
interface SavedRepository {
  id: string;
  userId: string;
  repoId: number;
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  description: string | null;
  owner: string;
  createdAt: string;
}

function WorkspaceBody() {

  // Dialog und GitHub-Repositories
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);

  // Ausgewähltes Repository
  const [selectedRepository, setSelectedRepository] =
    useState<GitHubRepository | null>(null);

  // Lade- und Fehlerzustände
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // Bereits gespeicherte Repositories beim Öffnen der Seite laden
  useEffect(() => {
    async function loadSavedRepositories() {
      try {
        const response = await fetch('/api/repositories', {
          cache: 'no-store',
        });

        if (!response.ok) {
          if (response.status !== 401) {
            console.error(
              'Gespeicherte Repositories konnten nicht geladen werden.'
            );
          }
          return;
        }

        const savedRepositories: SavedRepository[] = await response.json();

        if (savedRepositories.length > 0) {
          const repository = savedRepositories[0];

          setSelectedRepository({
            id: repository.repoId,
            name: repository.name,
            full_name: repository.fullName,
            description: repository.description,
            private: repository.private,
            html_url: repository.htmlUrl,
          });
        }
      } catch (err) {
        console.error(
          'Fehler beim Laden gespeicherter Repositories:',
          err
        );
      }
    }

    loadSavedRepositories();
  }, []);

  // GitHub-Repositories laden und den Dialog öffnen
  async function openRepositoryDialog() {
    setIsDialogOpen(true);
    setIsLoading(true);
    setError('');
    setSaveMessage('');

    try {
      const response = await fetch('/api/github/repos', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Bitte verbinde zuerst deinen GitHub-Account.'
            : 'Die GitHub-Repositories konnten nicht geladen werden.'
        );
      }

      const data: GitHubRepository[] = await response.json();
      setRepositories(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ein unerwarteter Fehler ist aufgetreten.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Repository in der Datenbank speichern
  async function selectRepository(repository: GitHubRepository) {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setError('');
    setSaveMessage('');

    try {
      const owner = repository.full_name.split('/')[0];

      const response = await fetch('/api/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...repository,
          owner,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? 'Das Repository konnte nicht gespeichert werden.'
        );
      }

      setSelectedRepository(repository);
      setIsDialogOpen(false);
      setSaveMessage(
        result.message === 'Repository bereits gespeichert'
          ? 'Dieses Repository ist bereits gespeichert.'
          : 'Repository erfolgreich gespeichert.'
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Ein unerwarteter Fehler ist aufgetreten.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-4xl">
      <div className="mb-8">
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
          Workspace
        </h2>
        <p className="mt-2 text-gray-600">
          Manage your repositories and prepare them for AI-powered testing.
        </p>
      </div>

      {/* GitHub-Verbindung und Repository-Auswahl */}
      <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-8 text-center shadow-sm">
        <h3 className="mb-2 text-2xl font-semibold">
          Connect GitHub &amp; Add Repository
        </h3>

        <p className="mb-6 text-gray-500">
          Connect your GitHub account to add repositories and generate AI-powered tests for your code.
        </p>

        <button
          type="button"
          onClick={openRepositoryDialog}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            className="h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          + Add Repository
        </button>

        {/* Speicherstatus */}
        {isSaving && (
          <p className="mt-4 text-sm text-gray-500" role="status">
            Saving repository...
          </p>
        )}

        {saveMessage && (
          <p className="mt-4 text-sm text-green-700" role="status">
            {saveMessage}
          </p>
        )}

        {error && !isDialogOpen && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {/* Ausgewähltes Repository */}
        {selectedRepository && (
          <div className="mt-6 w-full rounded-lg border border-gray-200 p-4 text-left">
            <p className="mb-1 text-sm text-gray-500">
              Selected Repository
            </p>

            <a
              href={selectedRepository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-700 hover:underline"
            >
              {selectedRepository.full_name}
            </a>

            <p className="mt-1 text-sm text-gray-500">
              {selectedRepository.private
                ? 'Private repository'
                : 'Public repository'}
            </p>
          </div>
        )}
      </div>

      {/* Repository-Auswahldialog */}
      {isDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!isSaving) {
              setIsDialogOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="repository-dialog-title"
            className="flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Dialog-Kopfzeile */}
            <div className="flex items-center justify-between border-b p-5">
              <h3
                id="repository-dialog-title"
                className="text-xl font-semibold"
              >
                Select a Repository
              </h3>

              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
                className="text-2xl text-gray-500 hover:text-black disabled:opacity-50"
                aria-label="Dialog schließen"
              >
                &times;
              </button>
            </div>

            {/* Dialog-Inhalt */}
            <div className="overflow-y-auto p-5">
              {isLoading && (
                <p className="py-6 text-center text-gray-500">
                  Loading repositories...
                </p>
              )}

              {!isLoading && error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                  <p>{error}</p>

                  <button
                    type="button"
                    onClick={openRepositoryDialog}
                    className="mt-3 font-medium underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!isLoading && !error && repositories.length > 0 && (
                <div className="space-y-3">
                  {repositories.map((repository) => (
                    <button
                      key={repository.id}
                      type="button"
                      disabled={isSaving}
                      onClick={() => selectRepository(repository)}
                      className="w-full rounded-lg border p-4 text-left transition-colors hover:border-blue-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="break-all font-semibold">
                          {repository.full_name}
                        </span>

                        <span className="shrink-0 text-xs text-gray-500">
                          {repository.private ? 'Private' : 'Public'}
                        </span>
                      </div>

                      {repository.description && (
                        <p className="mt-2 text-sm text-gray-500">
                          {repository.description}
                        </p>
                      )}

                      {isSaving && (
                        <p className="mt-2 text-sm text-gray-500">
                          Saving...
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!isLoading && !error && repositories.length === 0 && (
                <p className="py-6 text-center text-gray-500">
                  No repositories found!
                </p>
              )}
            </div>

            {/* Dialog-Fußzeile */}
            <div className="flex justify-end border-t p-4">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
                className="rounded-lg border px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceBody;