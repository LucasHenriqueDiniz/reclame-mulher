import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { reports } from "@/db/schema";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Login necessário para denunciar" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  if (!body.companyId || !body.reason) return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  const [report] = await db.insert(reports).values({
    reporterId: session.userId,
    type: "ABUSE",
    title: `Denúncia de empresa: ${body.reason}`,
    description: body.details || body.reason,
    relatedCompanyId: body.companyId,
    status: "PENDING",
  }).returning();
  return NextResponse.json({ report }, { status: 201 });
}
