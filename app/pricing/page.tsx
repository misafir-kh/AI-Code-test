import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <section className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm sm:px-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Pricing
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
          Ein faires Preismodell ist in Arbeit
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg text-gray-600">
          AI Code Test befindet sich noch in der Entwicklung. Preise und
          kostenpflichtige Pläne sind noch nicht festgelegt.
        </p>

        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Die Credits-Anzeige im Workspace ist momentan ein Platzhalter. Es
          werden darüber aktuell keine tatsächlichen Kosten abgerechnet.
        </p>

        <Link
          href="/workspace"
          className="mt-8 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
        >
          Zum Workspace
        </Link>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900">
          Was bei der Preisgestaltung berücksichtigt wird
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-900">Repositories</h3>
            <p className="mt-2 text-sm text-gray-600">
              Wie viele Projekte du mit deinem Konto verwaltest.
            </p>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-900">Testgenerierung</h3>
            <p className="mt-2 text-sm text-gray-600">
              Wie viele Testfälle für deine Projekte erstellt werden.
            </p>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-900">Testausführung</h3>
            <p className="mt-2 text-sm text-gray-600">
              Welche Kosten bei der Ausführung von Tests in einer Cloud-
              Browserumgebung entstehen.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}