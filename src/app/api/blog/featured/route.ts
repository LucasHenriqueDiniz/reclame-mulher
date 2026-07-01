import { NextResponse } from "next/server";

import { BlogRepo } from "@/server/repos/blog";

function estimateReadTime(content: string | null | undefined) {
  const words = content?.trim().split(/\s+/).filter(Boolean).length ?? 0;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

export async function GET() {
  try {
    const { posts } = await BlogRepo.findPublic(undefined, 1, 3);
    const tagsByPost = await BlogRepo.getPostTagsBatch(posts.map((post) => post.id));

    return NextResponse.json(
      posts.map((post) => {
        const tags = tagsByPost.get(post.id) ?? [];

        return {
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          imageUrl: post.coverUrl ?? "/blog-image.webp",
          publishedAt: (post.publishedAt ?? post.createdAt).toISOString(),
          author: {
            name: "Comunica Mulher",
            avatarUrl: "/blog-avatar.webp",
          },
          category: tags[0]?.name ?? "Recursos",
          readTime: estimateReadTime(post.contentMd ?? post.content),
        };
      })
    );
  } catch (error) {
    console.error("Error fetching featured blog posts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
