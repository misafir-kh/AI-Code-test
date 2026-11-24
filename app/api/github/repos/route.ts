import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getGitHubTokenForUser } from "@/lib/github-auth";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Bitte melde dich zuerst an." },
      { status: 401 }
    );
  }

  const cookieStore = await cookies();
  const hasToken = Boolean(cookieStore.get("github_token")?.value);
  const token = await getGitHubTokenForUser(userId);

  if (!token) {
    const response = NextResponse.json(
      { error: "Bitte verbinde zuerst dein GitHub-Konto." },
      { status: 401 }
    );
    if (hasToken) {
      response.cookies.delete("github_token");
      response.cookies.delete("github_clerk_user");
    }
    return response;
  }

  let githubResponse: Response;

  try {
    githubResponse = await fetch(
      "https://api.github.com/user/repos?sort=updated&per_page=100",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }
    );
  } catch (error) {
    console.error("GitHub repository request failed:", error);
    return NextResponse.json(
      { error: "GitHub ist gerade nicht erreichbar. Bitte versuche es erneut." },
      { status: 502 }
    );
  }

  if (githubResponse.status === 401) {
    const response = NextResponse.json(
      { error: "Deine GitHub-Verbindung ist abgelaufen. Bitte verbinde sie erneut." },
      { status: 401 }
    );
    response.cookies.delete("github_token");
    response.cookies.delete("github_clerk_user");
    return response;
  }

  if (githubResponse.status === 403 || githubResponse.status === 429) {
    return NextResponse.json(
      {
        error:
          githubResponse.headers.get("x-ratelimit-remaining") === "0"
            ? "Das GitHub-API-Limit ist erreicht. Bitte warte kurz und versuche es erneut."
            : "GitHub verweigert den Repository-Zugriff. Prüfe die Berechtigungen deiner Verbindung.",
      },
      { status: githubResponse.status }
    );
  }

  if (!githubResponse.ok) {
    console.error(
      "GitHub repository request failed:",
      githubResponse.status
    );
    return NextResponse.json(
      { error: "GitHub-Repositories konnten nicht geladen werden." },
      { status: 502 }
    );
  }

  const repositories: unknown = await githubResponse.json();
  return NextResponse.json(repositories);
}
