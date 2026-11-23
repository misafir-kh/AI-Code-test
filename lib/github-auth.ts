import { cookies } from "next/headers";

export async function getGitHubTokenForUser(userId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("github_token")?.value;
  const connectedUserId = cookieStore.get("github_clerk_user")?.value;

  return token && connectedUserId === userId ? token : null;
}
