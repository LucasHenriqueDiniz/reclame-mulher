import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // TODO: implementar lógica

    return NextResponse.json({ data: [] });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();

    // TODO: validar e salvar

    return NextResponse.json({ id: "novo-id" });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
