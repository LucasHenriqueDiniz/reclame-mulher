import { NextRequest, NextResponse } from "next/server";
import { BlogRepo } from "@/server/repos/blog";
import { erroInterno } from "@/server/http/respond";

// GET /api/blog/tags - Listar todas as tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    let tags;
    if (search) {
      tags = await BlogRepo.searchTags(search);
    } else {
      tags = await BlogRepo.getAllTags();
    }

    return NextResponse.json(tags);
  } catch (error) {
    return erroInterno(error, "blog/tags");
  }
}
