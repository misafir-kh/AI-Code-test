import React from 'react';

// Diese Komponente stellt den Hauptbereich (Body) des Workspaces dar.
function WorkspaceBody() {
  // Das sind Platzhalter-Credits. Später holen wir die echten aus der Datenbank.
  const credits = 2000; 

  return (
    // Der Haupt-Container für den Inhalt. 
    // max-w-4xl begrenzt die Breite, mx-auto zentriert ihn, mt-10 fügt Abstand nach oben hinzu.
    <div className="max-w-4xl mx-auto mt-10">
      
      {/* Oberer Bereich: Titel und Anzeige der verbleibenden Credits */}
      <div className="flex justify-between items-center mb-10">
        {/* Hauptüberschrift des Workspaces */}
        <h2 className="text-4xl font-bold">Workspace</h2>
        
        {/* Visuelle Box für die Credit-Anzeige mit hellblauem Hintergrund */}
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
          <span className="text-sm text-gray-500">Remaining Credits:</span>
          {/* Dynamischer Wert für die Credits */}
          <span className="font-bold text-blue-700">{credits}</span>
        </div>
      </div>

      {/* Sektion zum Verbinden eines GitHub-Accounts */}
      {/* Zentrierte Box mit Schatten und Rahmen, um die Aufmerksamkeit des Nutzers zu erregen */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center mt-8">
        <h3 className="text-2xl font-semibold mb-2">Connect GitHub & Add Repository</h3>
        <p className="text-gray-500 mb-6">Verbinde deinen Account, um KI-gestützte Tests für deinen Code zu generieren.</p>
        
        {/* Der Button zum Hinzufügen eines Repositories.
            Aktuell hat dieser Button noch keine Funktionalität (kein onClick-Handler).
            Er enthält ein SVG-Icon (vermutlich ein GitHub-Logo) und den Text "+ Add Repository". */}
        <button className="bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2">
           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path></svg>
           + Add Repository
        </button>
      </div>

    </div>
  );
}

export default WorkspaceBody;