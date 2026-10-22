// Importiert die Weiterleitungsfunktion von Next.js
import { redirect } from "next/navigation";

// GET-Endpunkt für den Start der GitHub-OAuth-Authentifizierung
export async function GET() {
  // Erstellt die URL-Parameter für die GitHub-Autorisierung
  const params = new URLSearchParams({
    // Client-ID der GitHub-OAuth-App aus den Umgebungsvariablen
    client_id: process.env.GITHUB_CLIENT_ID!,

    // Callback-URL, zu der GitHub nach der Autorisierung zurückleitet
    redirect_uri: process.env.GITHUB_REDIRECT_URI!,

    // Angeforderte Berechtigungen: Repository-Zugriff und Benutzerinformationen lesen
    scope: "repo read:user",
  });

  // Leitet den Benutzer zur GitHub-Autorisierungsseite weiter
  redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
}