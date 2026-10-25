import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";

import { db } from "@/db";
import { repositories, users } from "@/db/schema";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Nicht angemeldet" },
      { status: 401 }
    );
  }

  try {
    const savedRepositories = await db
      .select()
      .from(repositories)
      .where(eq(repositories.userId, userId));

    return NextResponse.json(savedRepositories);
  } catch (error) {
    console.error("Fehler beim Laden der Repositorys:", error);

    return NextResponse.json(
      { error: "Repositorys konnten nicht geladen werden" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Nicht angemeldet" },
      { status: 401 }
    );
  }

  try {
    // Benutzerinformationen aus der authentifizierten Clerk-Sitzung laden
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: "Benutzer konnte nicht geladen werden" },
        { status: 401 }
      );
    }

    const email = clerkUser.emailAddresses.find(
      (address) => address.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;

    if (!email) {
      return NextResponse.json(
        { error: "Für den Benutzer ist keine E-Mail-Adresse hinterlegt" },
        { status: 400 }
      );
    }

    // Sicherstellen, dass der angemeldete Clerk-Benutzer in unserer
    // Datenbank existiert.
    await db
      .insert(users)
      .values({
        id: userId,
        email,
      })
      .onConflictDoNothing({ target: users.id });

    const body = await request.json();

    const {
      id,
      name,
      full_name,
      description,
      private: isPrivate,
      html_url,
      owner,
    } = body;

    if (
      typeof id !== "number" ||
      typeof name !== "string" ||
      typeof full_name !== "string" ||
      typeof html_url !== "string" ||
      typeof owner !== "string" ||
      typeof isPrivate !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Ungültige Repository-Daten" },
        { status: 400 }
      );
    }

    // Prüfen, ob das Repository für diesen Benutzer bereits gespeichert ist.
    const existing = await db
      .select({ id: repositories.id })
      .from(repositories)
      .where(
        and(
          eq(repositories.userId, userId),
          eq(repositories.repoId, id)
        )
      );

    if (existing.length > 0) {
      return NextResponse.json(
        { message: "Repository bereits gespeichert" },
        { status: 200 }
      );
    }

    await db.insert(repositories).values({
      id: randomUUID(),
      userId,
      repoId: id,
      name,
      fullName: full_name,
      private: isPrivate,
      htmlUrl: html_url,
      description:
        typeof description === "string" ? description : null,
      owner,
    });

    return NextResponse.json(
      { message: "Repository erfolgreich gespeichert" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Fehler beim Speichern des Repositorys:", error);

    return NextResponse.json(
      { error: "Repository konnte nicht gespeichert werden" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "You must be signed in." },
      { status: 401 }
    );
  }

  const repositoryId = new URL(request.url).searchParams.get("id");

  if (!repositoryId) {
    return NextResponse.json(
      { error: "A repository ID is required." },
      { status: 400 }
    );
  }

  try {
    const deleted = await db
      .delete(repositories)
      .where(
        and(
          eq(repositories.id, repositoryId),
          eq(repositories.userId, userId)
        )
      )
      .returning({ id: repositories.id });

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Repository not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Repository removed." });
  } catch (error) {
    console.error("Failed to remove repository:", error);

    return NextResponse.json(
      { error: "Could not remove repository." },
      { status: 500 }
    );
  }
} 