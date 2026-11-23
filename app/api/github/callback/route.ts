import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function clearOAuthState(response: NextResponse) {
  response.cookies.set("github_oauth_state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/github/callback",
    maxAge: 0,
  });
  response.cookies.set("github_oauth_clerk_user", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/github/callback",
    maxAge: 0,
  });
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(
      new URL("/sign-in?redirect_url=%2Fworkspace", request.url)
    );
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const savedState = cookieStore.get("github_oauth_state")?.value;
  const initiatingUserId = cookieStore.get("github_oauth_clerk_user")?.value;

  if (
    !code ||
    !state ||
    !savedState ||
    state !== savedState ||
    initiatingUserId !== userId
  ) {
    const response = NextResponse.redirect(
      new URL("/workspace?github=authorization-error", request.url)
    );
    clearOAuthState(response);
    return response;
  }

  let tokenResponse: Response;

  try {
    tokenResponse = await fetch(
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
        signal: AbortSignal.timeout(10000),
      }
    );
  } catch (error) {
    console.error("GitHub token exchange failed:", error);
    const result = NextResponse.redirect(
      new URL("/workspace?github=connection-error", request.url)
    );
    clearOAuthState(result);
    return result;
  }

  const data: unknown = await tokenResponse.json().catch(() => null);

  if (
    !tokenResponse.ok ||
    typeof data !== "object" ||
    data === null ||
    !("access_token" in data) ||
    typeof data.access_token !== "string"
  ) {
    console.error("GitHub token exchange returned an invalid response.");
    const result = NextResponse.redirect(
      new URL("/workspace?github=connection-error", request.url)
    );
    clearOAuthState(result);
    return result;
  }

  const result = NextResponse.redirect(
    new URL("/workspace?github=connected", request.url)
  );
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60,
  };
  result.cookies.set("github_token", data.access_token, cookieOptions);
  result.cookies.set("github_clerk_user", userId, cookieOptions);
  clearOAuthState(result);

  return result;
}
