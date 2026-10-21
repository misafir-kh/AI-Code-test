import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  // GitHub-Token aus dem HTTP-only-Cookie lesen
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;

  // Prüfen, ob der Nutzer GitHub verbunden hat
  if (!token) {
    return NextResponse.json(
      { error: "GitHub is not connected" },
      { status: 401 }
    );
  }

  // Repositories über die GitHub-API abrufen
  const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });

  // Fehler der GitHub-API weitergeben
  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch GitHub repositories" },
      { status: response.status }
    );
  }

  // Repositories als JSON zurückgeben
  const repos = await response.json();

  return NextResponse.json(repos);
}