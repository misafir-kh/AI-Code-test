import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getGitHubTokenForUser } from "@/lib/github-auth";

function disconnectedResponse(clearCookies = false) {
  const response = NextResponse.json({ connected: false });

  if (clearCookies) {
    response.cookies.delete("github_token");
    response.cookies.delete("github_clerk_user");
  }

  return response;
}

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
    return disconnectedResponse(hasToken);
  }

  let githubResponse: Response;

  try {
    githubResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    console.error("GitHub connection status request failed:", error);
    return NextResponse.json(
      { error: "GitHub ist gerade nicht erreichbar. Bitte versuche es erneut." },
      { status: 502 }
    );
  }

  if (githubResponse.status === 401) {
    return disconnectedResponse(true);
  }

  if (!githubResponse.ok) {
    console.error(
      "GitHub connection status request failed:",
      githubResponse.status
    );
    return NextResponse.json(
      { error: "Der GitHub-Verbindungsstatus konnte nicht geladen werden." },
      { status: 502 }
    );
  }

  const githubUser: unknown = await githubResponse.json();

  if (
    typeof githubUser !== "object" ||
    githubUser === null ||
    !("login" in githubUser) ||
    typeof githubUser.login !== "string"
  ) {
    return NextResponse.json(
      { error: "GitHub hat ein ungültiges Profil zurückgegeben." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    connected: true,
    login: githubUser.login,
  });
}
