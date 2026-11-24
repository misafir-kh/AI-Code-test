import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AI Code Test",
    template: "%s | AI Code Test",
  },
  description:
    "GitHub-Repositories verbinden, KI-Testfälle erstellen und mit Playwright ausführen.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
