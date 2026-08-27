import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { db } from "@/db/client";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { BlogRepo } from "@/server/repos/blog";
import { CreatePostDto } from "@/server/dto/blog";
import { z } from "zod";
import { erroInterno, invalido, naoAutenticada, semPermissao } from "@/server/http/respond";

// GET /api/blog/posts - Listar posts públicos
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const scope = searchParams.get("scope");

    let isAdmin = false;
    if (session?.userId) {
      const [profile] = await db
        .select({ role: profiles.role })
        .from(profiles)
        .where(eq(profiles.userId, session.userId))
        .limit(1);

      isAdmin = profile?.role === "ADMIN";
    }

    let result;
    if (scope === "admin") {
      // 401 e 403 dizem coisas diferentes: sem sessão é "entre na sua conta",
      // com sessão e sem papel é "esta área não é sua". Esta rota é pública no
      // middleware, então a distinção precisa ser feita aqui.
      if (!session) {
        return naoAutenticada();
      }
      if (!isAdmin) {
        return semPermissao("Esta área é da administração da plataforma.");
      }

      result = await BlogRepo.findAll(page, limit);
    } else if (tag) {
      result = await BlogRepo.findByTagSlug(tag, page, limit);
    } else {
      result = await BlogRepo.findPublic(search, page, limit);
    }

    // Buscar tags em batch para todos os posts da página
    const postIds = result.posts.map((p) => p.id);
    const tagsMap = await BlogRepo.getPostTagsBatch(postIds);

    const postsWithTags = result.posts.map((post) => ({
      ...post,
      tags: tagsMap.get(post.id) ?? [],
    }));

    return NextResponse.json({
      posts: postsWithTags,
      total: result.total,
      page,
      limit,
    });
  } catch (error) {
    return erroInterno(error, "blog/posts");
  }
}

// POST /api/blog/posts - Criar post (ADMIN only)
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const validated = CreatePostDto.parse(body);

    const post = await BlogRepo.create(validated);

    return NextResponse.json(post, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating blog post:", error);
    
    if (error instanceof z.ZodError) {
      return invalido(error);
    }

    return erroInterno(error, "blog/posts");
  }
}
