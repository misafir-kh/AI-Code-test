import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Autorisierungscode aus der GitHub-Callback-URL lesen
  const code = request.nextUrl.searchParams.get("code");

  // Prüfen, ob GitHub einen Code zurückgegeben hat
  if (!code) {
    return NextResponse.json(
      { error: "GitHub authorization code missing" },
      { status: 400 }
    );
  }

  // Autorisierungscode gegen ein Access Token tauschen
  const response = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  );

  const data = await response.json();

  // Prüfen, ob GitHub ein Access Token zurückgegeben hat
  if (!response.ok || !data.access_token) {
    return NextResponse.json(
      { error: "Failed to obtain GitHub access token" },
      { status: 502 }
    );
  }

  // Access Token vorübergehend in einem sicheren Cookie speichern
  const result = NextResponse.redirect(new URL("/workspace", request.url));

  result.cookies.set("github_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return result;
}