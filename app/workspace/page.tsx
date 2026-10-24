import React from 'react';
// Wir importieren die Komponente (den Code), den wir gerade eben in der WorkspaceBody.tsx geschrieben haben.
import WorkspaceBody from './WorkspaceBody'; 
// Wir importieren die Funktion "auth" von Clerk, um zu prüfen, ob der Benutzer angemeldet ist.
import { auth } from "@clerk/nextjs/server";

// Das ist die Hauptfunktion für die Seite "localhost:3000/workspace".
// Da sie "Workspace" heißt und in der page.tsx liegt, wird sie von Next.js als die finale Ansicht für diesen URL-Pfad verstanden.
async function Workspace() {
  await auth.protect();
  return (
    // Ein einfaches HTML-div als Container.
    <div>
      {/* Hier laden wir die WorkspaceBody-Komponente. 
          Alles, was wir in WorkspaceBody.tsx (den Titel, die Credits, den "+ Add Repository" Button) gebaut haben, 
          wird hier nahtlos eingefügt und angezeigt. 
          Das ist das Geniale an React: Du schreibst Code einmal in einer separaten Datei und kannst ihn überall wie einen Legostein einbauen. */}
      <WorkspaceBody />
    </div>
  )
}

// Wir exportieren die Komponente, damit Next.js sie finden und im Browser rendern kann.
export default Workspace;