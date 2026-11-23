import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db";
import {
  repositories,
  testCases,
} from "@/db/schema";
import { isTestStep, MAX_TEST_STEPS } from "@/lib/test-steps";

type RouteContext = {
  params: Promise<{ repositoryId: string; testCaseId: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  const { repositoryId, testCaseId } = await params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (
    !isRecord(body) ||
    typeof body.title !== "string" ||
    body.title.trim().length === 0 ||
    body.title.length > 200 ||
    typeof body.description !== "string" ||
    body.description.trim().length === 0 ||
    body.description.length > 5000 ||
    !(typeof body.targetRoute === "string" || body.targetRoute === null) ||
    (typeof body.targetRoute === "string" && body.targetRoute.length > 500) ||
    typeof body.expectedResult !== "string" ||
    body.expectedResult.trim().length === 0 ||
    body.expectedResult.length > 5000 ||
    !Array.isArray(body.testSteps) ||
    body.testSteps.length > MAX_TEST_STEPS ||
    !body.testSteps.every(isTestStep)
  ) {
    return NextResponse.json(
      { error: "Test case fields or browser steps are invalid." },
      { status: 400 }
    );
  }

  try {
    const [ownedRepository] = await db
      .select({ id: repositories.id })
      .from(repositories)
      .where(
        and(
          eq(repositories.id, repositoryId),
          eq(repositories.userId, userId)
        )
      )
      .limit(1);

    if (!ownedRepository) {
      return NextResponse.json(
        { error: "Repository not found." },
        { status: 404 }
      );
    }

    const [updated] = await db
      .update(testCases)
      .set({
        title: body.title.trim(),
        description: body.description.trim(),
        targetRoute:
          typeof body.targetRoute === "string"
            ? body.targetRoute.trim() || null
            : null,
        expectedResult: body.expectedResult.trim(),
        testSteps: body.testSteps,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(testCases.id, testCaseId),
          eq(testCases.repositoryId, repositoryId)
        )
      )
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Test case not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ testCase: updated });
  } catch (error) {
    console.error("Failed to update test case:", error);

    return NextResponse.json(
      { error: "Could not update test case." },
      { status: 500 }
    );
  }
}
