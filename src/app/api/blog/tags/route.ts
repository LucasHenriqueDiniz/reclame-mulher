import { NextRequest, NextResponse } from "next/server";
import { BlogRepo } from "@/server/repos/blog";

// GET /api/blog/tags - list every tag
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
    console.error("Error fetching blog tags:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog tags" },
      { status: 500 }
    );
  }
}
