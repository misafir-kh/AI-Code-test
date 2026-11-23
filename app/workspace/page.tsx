import { auth } from "@clerk/nextjs/server";

import WorkspaceBody from "./WorkspaceBody";

export default async function WorkspacePage() {
  await auth.protect();
  return <WorkspaceBody />;
}
