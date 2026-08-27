import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BlogRepo } from "@/server/repos/blog";
import { UpdatePostDto } from "@/server/dto/blog";
import { z } from "zod";
import { ehUuid, erroInterno, invalido, naoAutenticada, naoEncontrado, semPermissao } from "@/server/http/respond";

// GET /api/blog/posts/[id] - Ver post específico
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!ehUuid(id)) return naoEncontrado();
    const session = await getSession();
    let isAdmin = false;

    if (session?.userId) {
      const [profile] = await db
        .select({ role: profiles.role })
        .from(profiles)
        .where(eq(profiles.userId, session.userId))
        .limit(1);

      isAdmin = profile?.role === "ADMIN";
    }

    const post = await BlogRepo.findByIdentifier(id, isAdmin);

    if (!post) {
      return naoEncontrado("Este artigo não existe ou foi removido.");
    }

    // Buscar tags do post
    const tags = await BlogRepo.getPostTags(post.id);

    return NextResponse.json({ ...post, tags });
  } catch (error) {
    return erroInterno(error, "blog/posts/[id]");
  }
}

// PUT /api/blog/posts/[id] - Atualizar post (ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return naoAutenticada();
    }

    // Verificar se é ADMIN
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.userId))
      .limit(1);

    if (profile?.role !== "ADMIN") {
      return semPermissao();
    }

    const { id } = await params;
    if (!ehUuid(id)) return naoEncontrado();
    const body = await request.json();
    const validated = UpdatePostDto.parse(body);

    const post = await BlogRepo.update(id, validated);

    if (!post) {
      return naoEncontrado("Este artigo não existe ou foi removido.");
    }

    return NextResponse.json(post);
  } catch (error: unknown) {
    console.error("Error updating blog post:", error);

    if (error instanceof z.ZodError) {
      return invalido(error);
    }

    return erroInterno(error, "blog/posts/[id]");
  }
}

// DELETE /api/blog/posts/[id] - Deletar post (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return naoAutenticada();
    }

    // Verificar se é ADMIN
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.userId))
      .limit(1);

    if (profile?.role !== "ADMIN") {
      return semPermissao();
    }

    const { id } = await params;
    if (!ehUuid(id)) return naoEncontrado();

    const deleted = await BlogRepo.delete(id);
    if (!deleted) {
      return naoEncontrado("Este artigo não existe ou foi removido.");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return erroInterno(error, "blog/posts/[id]");
  }
}
