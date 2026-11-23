import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { repositories, testCases } from "@/db/schema";

type RouteContext = {
  params: Promise<{ repositoryId: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function userOwnsRepository(repositoryId: string, userId: string) {
  const ownedRepository = await db
    .select({ id: repositories.id })
    .from(repositories)
    .where(
      and(
        eq(repositories.id, repositoryId),
        eq(repositories.userId, userId)
      )
    )
    .limit(1);

  return ownedRepository.length > 0;
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  const { repositoryId } = await params;

  try {
    const ownsRepository = await userOwnsRepository(repositoryId, userId);

    if (!ownsRepository) {
      return NextResponse.json(
        { error: "Repository not found." },
        { status: 404 }
      );
    }

    const savedTestCases = await db
      .select()
      .from(testCases)
      .where(eq(testCases.repositoryId, repositoryId));

    return NextResponse.json(savedTestCases);
  } catch (error) {
    console.error("Failed to load test cases:", error);

    return NextResponse.json(
      { error: "Could not load test cases." },
      { status: 500 }
    );
  }
}

export async function POST(
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

  const { repositoryId } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  if (!isRecord(body)) {
    return NextResponse.json(
      { error: "Invalid test case." },
      { status: 400 }
    );
  }

  const {
    title,
    description,
    testType,
    priority = "medium",
    targetRoute = null,
    targetFiles = [],
    expectedResult,
  } = body;

  const validTargetFiles =
    Array.isArray(targetFiles) &&
    targetFiles.length <= 30 &&
    targetFiles.every(
      (file): file is string =>
        typeof file === "string" &&
        file.trim().length > 0 &&
        file.length <= 500
    );

  if (
    typeof title !== "string" ||
    title.trim().length === 0 ||
    title.length > 200 ||
    typeof description !== "string" ||
    description.trim().length === 0 ||
    description.length > 5000 ||
    typeof testType !== "string" ||
    testType.trim().length === 0 ||
    testType.length > 50 ||
    typeof priority !== "string" ||
    !["low", "medium", "high"].includes(priority) ||
    !(typeof targetRoute === "string" || targetRoute === null) ||
    (typeof targetRoute === "string" && targetRoute.length > 500) ||
    !validTargetFiles ||
    typeof expectedResult !== "string" ||
    expectedResult.trim().length === 0 ||
    expectedResult.length > 5000
  ) {
    return NextResponse.json(
      { error: "Test case fields are missing or invalid." },
      { status: 400 }
    );
  }

  try {
    const ownsRepository = await userOwnsRepository(repositoryId, userId);

    if (!ownsRepository) {
      return NextResponse.json(
        { error: "Repository not found." },
        { status: 404 }
      );
    }

    const [createdTestCase] = await db
      .insert(testCases)
      .values({
        id: randomUUID(),
        repositoryId,
        title: title.trim(),
        description: description.trim(),
        testType: testType.trim(),
        priority,
        targetRoute:
          typeof targetRoute === "string"
            ? targetRoute.trim() || null
            : null,
        targetFiles: targetFiles.map((file) => file.trim()),
        expectedResult: expectedResult.trim(),
      })
      .returning();

    return NextResponse.json(createdTestCase, { status: 201 });
  } catch (error) {
    console.error("Failed to create test case:", error);

    return NextResponse.json(
      { error: "Could not create test case." },
      { status: 500 }
    );
  }
}