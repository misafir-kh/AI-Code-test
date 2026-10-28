// 1. IMPORTE
// wir importieren "Link" von Next.js, damit wir auf andere Seiten verlinken können.
import Link from 'next/link';
// Wir holen den "UserButton" aus dem Clerk-Paket. Das ist das fertige Profilbild-Menü.
import { UserButton } from '@clerk/nextjs';
// Wir importieren React, damit Next.js versteht, dass dies eine UI-Komponente ist.
import React from 'react';

// 2. DIE KOMPONENTE (Der Bilderrahmen)
// Wir nennen unsere Komponente "WorkspaceLayout".
// Das "{ children }" bedeutet: Hier wird später der Inhalt (die page.tsx) eingefügt.
function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    // Ein Container für die ganze Seite. 
    // "min-h-screen" sorgt dafür, dass er immer mindestens so hoch wie der Bildschirm ist.
    // "flex-col" ordnet die Elemente untereinander an (erst Header, dann Main-Bereich).
    <div className="flex flex-col min-h-screen">
      
      {/* 3. DER HEADER (Die Navigationsleiste ganz oben) */}
      {/* "justify-between" drückt die Elemente (Logo, Menü, Profil) ganz nach links, mitte und rechts auseinander. */}
      {/* "shadow-sm border-b" macht einen leichten Schatten und eine Linie darunter. */}
      <header className="flex justify-between items-center p-4 shadow-sm border-b">
        
        {/* LINKS: Dein Logo / Seitenname */}
        <div className="font-bold text-2xl text-blue-600">
          AI Code test
        </div>
        
        {/* MITTE: Die Menüpunkte */}
        <nav aria-label="Hauptnavigation">
          <ul className="flex gap-5 font-medium text-gray-700">
            <li>
              <a
                href="/api/github"
                className="hover:text-blue-600"
              >
                Connect GitHub
              </a>
            </li>
            <li>
              <Link href="/pricing" className="hover:text-blue-600">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/support" className="hover:text-blue-600">
                Support
              </Link>
            </li>
          </ul>
        </nav>
        
        {/* RECHTS: Credits und Profilbild */}
        <div className="flex items-center gap-4">
          
          {/* Credit-Anzeige (Blauer Kasten) */}
          <div className="flex items-center justify-between bg-blue-100 text-blue-800 px-3 py-1 rounded-lg">
            <h2 className="text-sm font-semibold">Credits: 2000</h2>
          </div>
          
          {/* Dein interaktives Clerk-Profilbild */}
          <UserButton />
        </div>
        
      </header>
      
      {/* 4. DER HAUPTBEREICH (Wo die Musik spielt) */}
      {/* "flex-grow" ist sehr wichtig! Das sorgt dafür, dass dieser Bereich den restlichen Platz bis unten ausfüllt. */}
      {/* "bg-gray-50" gibt dem Hintergrund ein ganz helles Grau. */}
      <main className="flex-grow p-8 bg-gray-50">
        
        {/* Hier lädt Next.js automatisch den Code aus deiner app/workspace/page.tsx rein! */}
        {children}
        
      </main>
    </div>
  );
}

// 5. EXPORT
// Wir müssen die Komponente exportieren, damit Next.js sie finden und nutzen kann.
export default WorkspaceLayout;