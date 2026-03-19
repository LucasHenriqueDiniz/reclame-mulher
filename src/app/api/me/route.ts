import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { profiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { CompanyUsersRepo } from "@/server/repos/company-users";

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
      .select({ metadata: users.metadata, mustChangePassword: users.mustChangePassword })
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    const membership = await CompanyUsersRepo.findMembership(session.userId);

    let parsedMeta: Record<string, string> = {};
    try {
      if (user?.metadata) parsedMeta = JSON.parse(user.metadata);
    } catch {}

    if (!user || !profile) {
      const response = NextResponse.json(
        { error: "Session out of sync" },
        { status: 401 }
      );
      await clearSessionCookie(response);
      return response;
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        metadata: parsedMeta,
        mustChangePassword: user.mustChangePassword,
      },
      profile,
      companyMembership: membership
        ? {
            companyId: membership.company.id,
            companyName: membership.company.name,
            role: membership.role,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
