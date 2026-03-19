import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession, clearSessionCookie } from "@/lib/auth/session";
import { db } from "@/db/client";
import { users, profiles, complaints } from "@/db/schema";

export async function DELETE() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete user data in transaction
    await db.transaction(async (tx) => {
      // Delete complaints
      await tx.delete(complaints).where(eq(complaints.authorId, session.userId));
      
      // Delete profile
      await tx.delete(profiles).where(eq(profiles.userId, session.userId));
      
      // Delete user
      await tx.delete(users).where(eq(users.id, session.userId));
    });

    // Clear session cookie
    const response = NextResponse.json({ success: true });
    await clearSessionCookie(response);

    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
