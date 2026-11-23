import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function DELETE() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Bitte melde dich zuerst an." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ connected: false });
  response.cookies.delete("github_token");
  response.cookies.delete("github_clerk_user");
  return response;
}
