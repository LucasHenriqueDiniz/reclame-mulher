import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.userId))
      .limit(1);

    const [user] = await db
      .select({ metadata: users.metadata })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    let parsedMeta: Record<string, string> = {};
    try {
      if (user?.metadata) parsedMeta = JSON.parse(user.metadata);
    } catch {}

    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        metadata: parsedMeta,
      },
      profile: profile ?? null,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
