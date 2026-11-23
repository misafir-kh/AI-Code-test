import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-5 py-4">
        <Link href="/" className="font-bold text-slate-950">
          AI Code <span className="text-blue-700">Test</span>
        </Link>
      </header>
      <main className="flex min-h-[calc(100vh-65px)] items-center justify-center p-4">
        <SignIn forceRedirectUrl="/workspace" />
      </main>
    </div>
  );
}
