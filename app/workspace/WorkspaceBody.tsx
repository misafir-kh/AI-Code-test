'use client';

import React, { useEffect, useState } from 'react';
import TestCaseCard, { type TestCase } from './TestCaseCard';

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
  targetUrl: string | null;
  testInstructions: string | null;
  createdAt: string;
}

function WorkspaceBody() {

  // Dialog und GitHub-Repositories
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [repositorySearch, setRepositorySearch] = useState('');

  // Ausgewähltes Repository
  const [savedRepositories, setSavedRepositories] = useState<SavedRepository[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [removingRepositoryId, setRemovingRepositoryId] = useState<string | null>(null);
  const [editingRepository, setEditingRepository] =
  useState<SavedRepository | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [testInstructions, setTestInstructions] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Lade- und Fehlerzustände
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [testCasesByRepository, setTestCasesByRepository] =
  useState<Record<string, TestCase[]>>({});
  const [generatingRepositoryId, setGeneratingRepositoryId] =
  useState<string | null>(null);
  const [selectedTestCaseIds, setSelectedTestCaseIds] = useState<string[]>([]);
  const [runningRepositoryId, setRunningRepositoryId] = useState<string | null>(null);
  const filteredRepositories = repositories.filter((repository) => {
  const search = repositorySearch.trim().toLowerCase();

  if (!search) {
    return true;
  }

  return (
    repository.name.toLowerCase().includes(search) ||
    repository.full_name.toLowerCase().includes(search) ||
    repository.description?.toLowerCase().includes(search)
  );
});

function updateTestCase(repositoryId: string, updatedTestCase: TestCase) {
  setTestCasesByRepository((current) => ({
    ...current,
    [repositoryId]: (current[repositoryId] ?? []).map((testCase) =>
      testCase.id === updatedTestCase.id ? updatedTestCase : testCase
    ),
  }));
}

function toggleTestCaseSelection(testCaseId: string, checked: boolean) {
  setSelectedTestCaseIds((current) =>
    checked
      ? [...new Set([...current, testCaseId])]
      : current.filter((id) => id !== testCaseId)
  );
}

async function runSelectedTestCases(repository: SavedRepository) {
  const selected = (testCasesByRepository[repository.id] ?? []).filter((testCase) =>
    selectedTestCaseIds.includes(testCase.id)
  );

  if (selected.length === 0 || runningRepositoryId) return;

  setRunningRepositoryId(repository.id);
  setError('');
  setSaveMessage('');

  let passed = 0;
  let failed = 0;

  try {
    for (const testCase of selected) {
      const response = await fetch(
        `/api/repositories/${encodeURIComponent(repository.id)}/test-cases/${encodeURIComponent(testCase.id)}/run`,
        { method: 'POST' }
      );
      const result: { error?: string; testCase?: TestCase } = await response.json();

      if (result.testCase) {
        updateTestCase(repository.id, result.testCase);
        if (result.testCase.lastRunStatus === 'passed') passed += 1;
        else failed += 1;
      } else {
        failed += 1;
      }

      if (!response.ok && !result.testCase) {
        throw new Error(result.error ?? `Testfall „${testCase.title}“ konnte nicht ausgeführt werden.`);
      }
    }

    setSaveMessage(`${passed} bestanden, ${failed} fehlgeschlagen.`);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Die ausgewählten Testfälle konnten nicht ausgeführt werden.');
  } finally {
    setRunningRepositoryId(null);
  }
}

async function generateTestCases(repository: SavedRepository) {
  if (generatingRepositoryId !== null) {
    return;
  }

  setGeneratingRepositoryId(repository.id);
  setError('');
  setSaveMessage('');

  try {
    const response = await fetch(
      `/api/repositories/${encodeURIComponent(repository.id)}/test-cases/generate-test-cases`,
      { method: 'POST' }
    );

    const result: {
      error?: string;
      testCases?: TestCase[];
    } = await response.json();

    if (!response.ok) {
      throw new Error(result.error ?? "Testfälle konnten nicht erstellt werden.");
    }

    if (!Array.isArray(result.testCases)) {
      throw new Error("Der Server hat keine Testfälle zurückgegeben.");
    }

    setTestCasesByRepository((current) => ({
      ...current,
      [repository.id]: result.testCases!,
    }));

    setSaveMessage(`${result.testCases.length} Testfälle wurden erstellt.`);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'An unexpected error occurred.'
    );
  } finally {
    setGeneratingRepositoryId(null);
  }
}

  // Bereits gespeicherte Repositories beim Öffnen der Seite laden
  useEffect(() => {
    async function loadSavedRepositories() {
      setIsLoadingSaved(true);

      try {
        const response = await fetch('/api/repositories', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error("Repositorys konnten nicht geladen werden.");
        }

        const data: SavedRepository[] = await response.json();
        setSavedRepositories(data);
        const testCaseEntries = await Promise.all(
          data.map(async (repository) => {
            const response = await fetch(
              `/api/repositories/${encodeURIComponent(repository.id)}/test-cases`,
              { cache: 'no-store' }
            );

            if (!response.ok) {
              throw new Error(
                `Testfälle für ${repository.fullName} konnten nicht geladen werden.`
              );
            }

            const testCases: TestCase[] = await response.json();
            return [repository.id, testCases] as const;
          })
        );

        setTestCasesByRepository(Object.fromEntries(testCaseEntries));
      } catch (err) {
        console.error('Failed to load saved repositories:', err);
        setError(
          err instanceof Error
            ? err.message
            : "Ein unerwarteter Fehler ist aufgetreten."
        );
      } finally {
        setIsLoadingSaved(false);
      }
    }

    void loadSavedRepositories();
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
            ? "Bitte verbinde zuerst dein GitHub-Konto."
            : "GitHub-Repositorys konnten nicht geladen werden."
        );
      }

      const data: GitHubRepository[] = await response.json();
      setRepositories(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred.'
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
          result.error ?? "Das Repository konnte nicht gespeichert werden."
        );
      }

      const savedResponse = await fetch('/api/repositories', {
        cache: 'no-store',
      });

      if (!savedResponse.ok) {
        throw new Error("Die Repository-Liste konnte nicht aktualisiert werden.");
      }

      const savedData: SavedRepository[] = await savedResponse.json();
      setSavedRepositories(savedData);
      setIsDialogOpen(false);
      setSaveMessage(
        result.message === 'Repository already saved.'
          ? "Dieses Repository ist bereits gespeichert."
          : "Repository wurde hinzugefügt."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred.'
      );
    } finally {
      setIsSaving(false);
    }
  }
  async function removeRepository(repository: SavedRepository) {
  if (removingRepositoryId) {
    return;
  }

  setRemovingRepositoryId(repository.id);
  setError('');
  setSaveMessage('');

  try {
    const response = await fetch(
      `/api/repositories?id=${encodeURIComponent(repository.id)}`,
      { method: 'DELETE' }
    );
    const result: { error?: string; message?: string } =
      await response.json();

    if (!response.ok) {
      throw new Error(result.error ?? "Repository konnte nicht entfernt werden.");
    }

    setSavedRepositories((current) =>
      current.filter((item) => item.id !== repository.id)
    );
    setSaveMessage(result.message ?? "Repository wurde aus dem Workspace entfernt.");
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'An unexpected error occurred.'
    );
  } finally {
    setRemovingRepositoryId(null);
  }
}

  async function saveRepositorySettings() {
    if (!editingRepository || isSavingSettings) {
      return;
    }

    setIsSavingSettings(true);
    setError('');
    setSaveMessage('');

    try {
      const response = await fetch('/api/repositories', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingRepository.id,
          targetUrl,
          testInstructions,
        }),
      });

      const result: { error?: string; message?: string } =
        await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Repository-Einstellungen konnten nicht gespeichert werden.");
      }

      const savedTargetUrl = targetUrl.trim() || null;
      const savedInstructions = testInstructions.trim() || null;

      setSavedRepositories((current) =>
        current.map((repository) =>
          repository.id === editingRepository.id
            ? {
                ...repository,
                targetUrl: savedTargetUrl,
                testInstructions: savedInstructions,
              }
            : repository
        )
      );

      setEditingRepository(null);
      setSaveMessage(result.message ?? "Repository-Einstellungen gespeichert.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ein unerwarteter Fehler ist aufgetreten."
      );
    } finally {
      setIsSavingSettings(false);
    }
  }

  function openRepositorySettings(repository: SavedRepository) {
    setEditingRepository(repository);
    setTargetUrl(repository.targetUrl ?? '');
    setTestInstructions(repository.testInstructions ?? '');
    setError('');
    setSaveMessage('');
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-7">
        <p className="text-sm font-semibold text-blue-700">Übersicht</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Workspace
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Repositorys verwalten und Browser-Tests ausführen.
        </p>
      </div>

      {/* GitHub-Verbindung und Repository-Auswahl */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Deine Repositorys
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Verbundene Projekte und ihre Testfälle.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
            {savedRepositories.length}
          </span>
        </div>

        <button
          type="button"
          onClick={openRepositoryDialog}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
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
          Repository hinzufügen
        </button>

        {/* Speicherstatus */}
        {isSaving && (
          <p className="mt-4 text-sm text-slate-500" role="status">
            Repository wird gespeichert …
          </p>
        )}

        {saveMessage && (
          <div className="mt-4 flex items-start justify-between gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <p role="status">{saveMessage}</p>
            <button
              type="button"
              onClick={() => setSaveMessage("")}
              aria-label="Erfolgsmeldung schließen"
              className="-mr-1 -mt-1 rounded p-1 text-emerald-700 hover:bg-emerald-100"
            >
              &times;
            </button>
          </div>
        )}

        {error && !isDialogOpen && !editingRepository && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 w-full text-left">
          {isLoadingSaved ? (
            <p className="text-sm text-slate-500" role="status">
              Repositorys werden geladen …
            </p>
          ) : savedRepositories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center">
              <p className="font-medium text-slate-800">
                Noch keine Repositorys hinzugefügt
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Füge ein Repository hinzu, um passende Testfälle zu erstellen.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {savedRepositories.map((repository) => (
                <li
                  key={repository.id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <a
                        href={repository.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all font-semibold text-blue-700 hover:underline"
                      >
                        {repository.fullName}
                      </a>
                      <p className="mt-1 text-sm text-slate-500">
                        {repository.private ? "Privat" : "Öffentlich"}
                        {repository.targetUrl ? ` · ${repository.targetUrl}` : ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openRepositorySettings(repository)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Einstellungen
                      </button>

                      <button
                        type="button"
                        onClick={() => generateTestCases(repository)}
                        disabled={generatingRepositoryId !== null}
                        className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {generatingRepositoryId === repository.id
                          ? "Tests werden erstellt …"
                          : "Tests generieren"}
                      </button>

                      <button
                        type="button"
                        onClick={() => removeRepository(repository)}
                        disabled={removingRepositoryId !== null}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {removingRepositoryId === repository.id
                          ? "Wird entfernt …"
                          : "Entfernen"}
                      </button>
                    </div>
                  </div>

                  {testCasesByRepository[repository.id]?.length > 0 && (
                    <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                      {(() => {
                        const cases = testCasesByRepository[repository.id] ?? [];
                        const passed = cases.filter((item) => item.lastRunStatus === 'passed').length;
                        const failed = cases.filter((item) => item.lastRunStatus === 'failed').length;
                        const selectedCount = cases.filter((item) => selectedTestCaseIds.includes(item.id)).length;
                        const executed = passed + failed;

                        return (
                          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-700">
                              <span><strong>{cases.length}</strong> Tests</span>
                              <span className="text-emerald-700"><strong>{passed}</strong> bestanden</span>
                              <span className="text-red-700"><strong>{failed}</strong> fehlgeschlagen</span>
                              <span><strong>{executed ? Math.round((passed / executed) * 100) : 0}%</strong> Pass-Rate</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => void runSelectedTestCases(repository)}
                              disabled={selectedCount === 0 || runningRepositoryId !== null}
                              className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {runningRepositoryId === repository.id
                                ? 'Ausgewählte Tests laufen …'
                                : `${selectedCount} ausgewählte Tests starten`}
                            </button>
                          </div>
                        );
                      })()}
                      {testCasesByRepository[repository.id].map((testCase) => (
                        <TestCaseCard
                          key={testCase.id}
                          repositoryId={repository.id}
                          testCase={testCase}
                          onTestCaseChange={(updatedTestCase) =>
                            updateTestCase(repository.id, updatedTestCase)
                          }
                          selected={selectedTestCaseIds.includes(testCase.id)}
                          onSelectedChange={(checked) =>
                            toggleTestCaseSelection(testCase.id, checked)
                          }
                        />
                      ))}
                    </div>
                  )}
                  {generatingRepositoryId === repository.id && (
                    <p className="mt-4 text-sm text-slate-500" role="status">
                      GitHub-Dateien werden analysiert und Gemini erstellt fünf
                      passende Testfälle. Das kann kurz dauern.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

            {editingRepository && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (!isSavingSettings) {
              setEditingRepository(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="repository-settings-title"
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2
              id="repository-settings-title"
              className="text-xl font-semibold text-gray-900"
            >
              Repository-Einstellungen
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {editingRepository.fullName}
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="repository-target-url"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Zieladresse der Website
                </label>
                <input
                  id="repository-target-url"
                  type="url"
                  value={targetUrl}
                  onChange={(event) => setTargetUrl(event.target.value)}
                  placeholder="http://localhost:3000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Browserbase testet veröffentlichte Zieladressen in der Cloud;
                  ohne API-Key sind lokale Adressen verfügbar.
                </p>
              </div>

              <div>
                <label
                  htmlFor="repository-test-instructions"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Zusätzliche Testhinweise
                </label>
                <textarea
                  id="repository-test-instructions"
                  value={testInstructions}
                  onChange={(event) => setTestInstructions(event.target.value)}
                  rows={5}
                  placeholder="Zum Beispiel: Anmeldung und Formularvalidierung prüfen."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Optionaler Kontext für die KI-Testgenerierung.
                </p>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingRepository(null)}
                disabled={isSavingSettings}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveRepositorySettings}
                disabled={isSavingSettings}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSavingSettings ? "Speichern …" : "Einstellungen speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              {!isLoading && !error && repositories.length > 0 && (
                <div className="border-b border-gray-200 p-4">
                  <label
                    htmlFor="repository-search"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Repositorys suchen
                  </label>
                  <input
                    id="repository-search"
                    type="search"
                    value={repositorySearch}
                    onChange={(event) => setRepositorySearch(event.target.value)}
                    placeholder="Name oder Beschreibung"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
                className="text-2xl text-gray-500 hover:text-black disabled:opacity-50"
                aria-label="                Fenster schließen"
              >
                &times;
              </button>
            </div>
            

            {/* Dialog-Inhalt */}
            <div className="overflow-y-auto p-5">
              {isLoading && (
                <p className="py-6 text-center text-gray-500">
                  GitHub-Repositorys werden geladen …
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
                    Erneut versuchen
                  </button>
                  {error.toLowerCase().includes("github") && (
                    <a
                      href="/api/github"
                      className="ml-4 mt-3 inline-block font-medium underline"
                    >
                      GitHub verbinden
                    </a>
                  )}
                </div>
              )}

              {!isLoading && !error && repositories.length > 0 && (
                <div className="space-y-3">
                  {filteredRepositories.map((repository) => (
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
                          {repository.private ? "Privat" : "Öffentlich"}
                        </span>
                      </div>

                      {repository.description && (
                        <p className="mt-2 text-sm text-gray-500">
                          {repository.description}
                        </p>
                      )}

                      {isSaving && (
                        <p className="mt-2 text-sm text-gray-500">
                          Wird gespeichert …
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}

            {!isLoading && !error && repositories.length === 0 && (
              <p className="py-6 text-center text-gray-500">
                Keine Repositorys gefunden.
              </p>
            )}

            {!isLoading &&
              !error &&
              repositories.length > 0 &&
              filteredRepositories.length === 0 && (
                <p className="py-6 text-center text-gray-500">
                  Keine passenden Repositorys gefunden.
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
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkspaceBody;
