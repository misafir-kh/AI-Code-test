'use client';

import { useState } from 'react';
import type { TestStep, TestStepRole } from '@/db/schema';
import { MAX_TEST_STEPS } from '@/lib/test-steps';

export interface TestCase {
  id: string;
  title: string;
  description: string;
  testType: string;
  priority: string;
  targetRoute: string | null;
  targetFiles: string[];
  expectedResult: string;
  testSteps: TestStep[];
  lastRunStatus: 'passed' | 'failed' | null;
  lastRunLogs: string[];
  lastRunAt: string | null;
  lastRunBrowserbaseSessionId: string | null;
  lastRunBrowserbaseSessionUrl: string | null;
}

type TestCaseCardProps = {
  repositoryId: string;
  testCase: TestCase;
  onTestCaseChange: (testCase: TestCase) => void;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
};

const roles: TestStepRole[] = [
  'button',
  'link',
  'textbox',
  'checkbox',
  'radio',
  'heading',
  'combobox',
  'option',
];

function emptyStep(action: TestStep['action']): TestStep {
  if (action === 'navigate') return { action, path: '/' };
  if (action === 'click' || action === 'expectVisible') {
    return { action, role: 'button', name: '' };
  }
  if (action === 'fill') {
    return { action, role: 'textbox', name: '', value: '' };
  }
  return { action, text: '' };
}

export default function TestCaseCard({
  repositoryId,
  testCase,
  onTestCaseChange,
  selected = false,
  onSelectedChange,
}: TestCaseCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({
    title: testCase.title,
    description: testCase.description,
    targetRoute: testCase.targetRoute ?? '/',
    expectedResult: testCase.expectedResult,
    testSteps: testCase.testSteps ?? [],
  });

  function openEditor() {
    setDraft({
      title: testCase.title,
      description: testCase.description,
      targetRoute: testCase.targetRoute ?? '/',
      expectedResult: testCase.expectedResult,
      testSteps: testCase.testSteps ?? [],
    });
    setError('');
    setIsEditing(true);
  }

  function updateStep(index: number, step: TestStep) {
    setDraft((current) => ({
      ...current,
      testSteps: current.testSteps.map((item, itemIndex) =>
        itemIndex === index ? step : item
      ),
    }));
  }

  async function saveTestCase() {
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(
        `/api/repositories/${encodeURIComponent(repositoryId)}/test-cases/${encodeURIComponent(testCase.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft),
        }
      );
      const result: { error?: string; testCase?: TestCase } =
        await response.json();

      if (!response.ok || !result.testCase) {
        throw new Error(result.error ?? 'Could not save this test case.');
      }

      onTestCaseChange(result.testCase);
      setIsEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not save this test case.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function runTestCase() {
    setIsRunning(true);
    setError('');

    try {
      const response = await fetch(
        `/api/repositories/${encodeURIComponent(repositoryId)}/test-cases/${encodeURIComponent(testCase.id)}/run`,
        { method: 'POST' }
      );
      const result: { error?: string; testCase?: TestCase } =
        await response.json();

      if (result.testCase) {
        onTestCaseChange(result.testCase);
      }

      if (!response.ok || !result.testCase) {
        throw new Error(result.error ?? 'Could not run this test case.');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not run this test case.'
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <article className="rounded-lg bg-gray-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          {onSelectedChange && (
            <input
              type="checkbox"
              checked={selected}
              onChange={(event) => onSelectedChange(event.target.checked)}
              aria-label={`Testfall ${testCase.title} auswählen`}
              className="mt-1 size-4 accent-blue-700"
            />
          )}
          <div>
            <h4 className="font-semibold text-gray-900">{testCase.title}</h4>
            <p className="mt-1 text-sm text-gray-600">{testCase.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {testCase.lastRunStatus && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                testCase.lastRunStatus === 'passed'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {testCase.lastRunStatus === 'passed'
                ? 'Bestanden'
                : 'Fehlgeschlagen'}
            </span>
          )}
          <button
            type="button"
            onClick={openEditor}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white"
          >
            Test bearbeiten
          </button>
          <button
            type="button"
            onClick={runTestCase}
            disabled={isRunning}
            className="rounded-lg bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning
              ? testCase.testSteps?.length
                ? "Test läuft …"
                : "Test wird vorbereitet …"
              : "Test starten"}
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        {testCase.testType} · {testCase.priority} · {testCase.targetRoute || '/'}
      </p>
      <p className="mt-2 text-sm text-gray-700">
        <strong>Erwartetes Ergebnis:</strong> {testCase.expectedResult}
      </p>

      {error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {testCase.lastRunLogs?.length > 0 && (
        <details className="mt-3 rounded border border-gray-200 bg-white p-3">
          <summary className="cursor-pointer text-sm font-medium text-gray-700">
            Letzte Ausführung
          </summary>
          <ul className="mt-2 space-y-1 font-mono text-xs text-gray-600">
            {testCase.lastRunLogs.map((log, index) => (
              <li key={`${testCase.id}-log-${index}`}>{log}</li>
            ))}
          </ul>
        </details>
      )}

      {testCase.lastRunBrowserbaseSessionUrl && (
        <a
          href={testCase.lastRunBrowserbaseSessionUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex text-sm font-semibold text-blue-700 hover:underline"
        >
          Browserbase-Aufzeichnung öffnen ↗
        </a>
      )}

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-test-case-${testCase.id}`}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            <h3
              id={`edit-test-case-${testCase.id}`}
              className="text-xl font-semibold text-gray-900"
            >
              Testfall und Browser-Schritte bearbeiten
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Die Schritte laufen lokal gegen die Zieladresse. Verwende
              zugängliche Elementrollen und Namen.
            </p>

            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Titel
                <input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft({ ...draft, title: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Beschreibung
                <textarea
                  rows={2}
                  value={draft.description}
                  onChange={(event) =>
                    setDraft({ ...draft, description: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Startpfad
                <input
                  value={draft.targetRoute}
                  onChange={(event) =>
                    setDraft({ ...draft, targetRoute: event.target.value })
                  }
                  placeholder="/"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Erwartetes Ergebnis
                <textarea
                  rows={2}
                  value={draft.expectedResult}
                  onChange={(event) =>
                    setDraft({ ...draft, expectedResult: event.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Browser-Schritte</h4>
                  <label className="flex items-center gap-2 text-sm">
                    Schritt hinzufügen
                    <select
                      value=""
                      disabled={draft.testSteps.length >= MAX_TEST_STEPS}
                      onChange={(event) => {
                        if (!event.target.value) return;
                        setDraft((current) => ({
                          ...current,
                          testSteps: [
                            ...current.testSteps,
                            emptyStep(event.target.value as TestStep['action']),
                          ],
                        }));
                      }}
                      className="rounded-lg border border-gray-300 px-2 py-1"
                    >
                      <option value="">Aktion wählen</option>
                      <option value="navigate">Pfad öffnen</option>
                      <option value="click">Element anklicken</option>
                      <option value="fill">Feld ausfüllen</option>
                      <option value="expectVisible">Sichtbarkeit prüfen</option>
                      <option value="expectText">Text prüfen</option>
                    </select>
                  </label>
                </div>
                {draft.testSteps.length >= MAX_TEST_STEPS && (
                  <p className="text-xs text-gray-500">
                    A test case can have up to {MAX_TEST_STEPS} steps.
                  </p>
                )}

                {draft.testSteps.length === 0 && (
                  <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                    Noch keine Schritte. Du kannst sie selbst ergänzen oder
                    einfach „Test starten“ wählen, damit sie automatisch erstellt werden.
                  </p>
                )}

                {draft.testSteps.map((step, index) => (
                  <div
                    key={`${testCase.id}-step-${index}`}
                    className="space-y-2 rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        Schritt {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            testSteps: current.testSteps.filter(
                              (_, stepIndex) => stepIndex !== index
                            ),
                          }))
                        }
                        className="text-sm text-red-700 hover:underline"
                      >
                        Entfernen
                      </button>
                    </div>

                    <select
                      aria-label={`Action for step ${index + 1}`}
                      value={step.action}
                      onChange={(event) =>
                        updateStep(
                          index,
                          emptyStep(event.target.value as TestStep['action'])
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="navigate">Pfad öffnen</option>
                      <option value="click">Element anklicken</option>
                      <option value="fill">Feld ausfüllen</option>
                      <option value="expectVisible">Sichtbarkeit prüfen</option>
                      <option value="expectText">Text prüfen</option>
                    </select>

                    {step.action === 'navigate' && (
                      <input
                        aria-label={`Path for step ${index + 1}`}
                        value={step.path}
                        onChange={(event) =>
                          updateStep(index, {
                            ...step,
                            path: event.target.value,
                          })
                        }
                        placeholder="/"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    )}

                    {(step.action === 'click' ||
                      step.action === 'expectVisible' ||
                      step.action === 'fill') && (
                      <>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <select
                            aria-label={`Element role for step ${index + 1}`}
                            value={step.role}
                            onChange={(event) => {
                              const role = event.target.value as TestStepRole;
                              if (step.action === 'fill') {
                                updateStep(index, { ...step, role });
                              } else {
                                updateStep(index, { ...step, role });
                              }
                            }}
                            className="rounded-lg border border-gray-300 px-3 py-2"
                          >
                            {roles.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                          <input
                            aria-label={`Accessible name for step ${index + 1}`}
                            value={step.name}
                            onChange={(event) =>
                              updateStep(index, {
                                ...step,
                                name: event.target.value,
                              })
                            }
                            placeholder="Zugänglicher Name, z. B. Anmelden"
                            className="rounded-lg border border-gray-300 px-3 py-2"
                          />
                        </div>
                        {step.action === 'fill' && (
                          <input
                            aria-label={`Value for step ${index + 1}`}
                            value={step.value}
                            onChange={(event) =>
                              updateStep(index, {
                                ...step,
                                value: event.target.value,
                              })
                            }
                            placeholder="Einzugebender Text"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                          />
                        )}
                      </>
                    )}

                    {step.action === 'expectText' && (
                      <input
                        aria-label={`Expected text for step ${index + 1}`}
                        value={step.text}
                        onChange={(event) =>
                          updateStep(index, {
                            ...step,
                            text: event.target.value,
                          })
                        }
                        placeholder="Text, der sichtbar sein soll"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-700" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={saveTestCase}
                disabled={isSaving}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isSaving ? "Wird gespeichert …" : "Test speichern"}
              </button>
            </div>
          </section>
        </div>
      )}
    </article>
  );
}
