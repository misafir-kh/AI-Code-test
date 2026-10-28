import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Support
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
          Wie können wir helfen?
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-gray-600">
            Schreibe uns eine E-Mail an <a href="mailto:musaferjasem@gmail.com" className="text-blue-600 hover:underline">
              musaferjasem@gmail.com
            </a>
        </p>

        <Link
          href="/workspace"
          className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"
        >
          Workspace öffnen
        </Link>
      </section>

      <section className="mt-10 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          Wir freuen uns über dein Feedback, deine Fragen oder Anregungen. Bitte zögere nicht, uns zu kontaktieren.
        </h2>
      </section>
    </div>
  );
}