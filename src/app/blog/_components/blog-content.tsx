"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BlogPostCard, toBlogCardPost } from "@/components/blog/BlogPostCard";
import { useIsAdmin } from "@/hooks/use-auth-state";
import { Plus } from "lucide-react";
import type { PostDoBlog } from "../_lib/posts";

/**
 * Só apresentação. Os posts chegam prontos do servidor, então não há estado de
 * carregamento aqui — e é justamente isso que impede o deslocamento de layout:
 * cabeçalho e rodapé nunca são desmontados porque nunca houve uma segunda
 * árvore para trocar.
 */
export function BlogContent({ posts }: { posts: PostDoBlog[] }) {
  const { isAdmin } = useIsAdmin();

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 10);

  return (
    <div className="self-stretch py-12 px-4 sm:px-6 lg:px-[92px]">
      {/* Featured Post */}
      {featuredPost && (
        <div className="flex flex-col items-start self-stretch relative pb-[104px] mb-20">
          <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={featuredPost.coverUrl || "/blog-image.webp"}
              alt={featuredPost.title}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
          <div className="flex flex-col items-start bg-white absolute bottom-0 left-4 sm:left-16 py-8 px-8 max-w-[600px] rounded-2xl border border-solid border-gray-100 shadow-2xl">
            <div className="flex items-center mb-4 gap-3 flex-wrap">
              {featuredPost.tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center bg-gradient-to-r from-[#1565C0] to-[#0D47A1] text-white text-sm font-medium py-2 px-4 rounded-full shadow-md"
                >
                  {tag.name}
                </span>
              ))}
            </div>
            <h1 className="text-[#181A2A] text-3xl sm:text-4xl font-bold mb-6 leading-tight">
              {featuredPost.title}
            </h1>
            <div className="flex items-center gap-5">
              <span className="text-gray-500 text-sm">
                {new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString("pt-BR")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Posts Section */}
      <div className="flex flex-col self-stretch gap-10">
        <div className="flex justify-between items-center self-stretch flex-wrap gap-4">
          <div>
            <h2 className="text-[#181A2A] text-3xl font-bold mb-2">Postagens recentes</h2>
            <p className="text-gray-600">Explore nossos conteúdos mais recentes</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/blog/new/edit"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Criar Post</span>
              </Link>
            )}
            <Link
              href="/blog/all"
              className="hidden sm:flex shrink-0 items-center gap-2 text-[#1565C0] hover:text-[#0D47A1] font-semibold transition-colors group"
            >
              <span>Ver Todos</span>
              <svg
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Blog Grid */}
        {recentPosts.length > 0 ? (
          <div className="flex flex-col self-stretch gap-6">
            {[0, 3, 6].map((startIndex) => (
              <div key={startIndex} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentPosts.slice(startIndex, startIndex + 3).map((post) => (
                  <BlogPostCard key={post.id} post={toBlogCardPost(post)} />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Nenhum post disponível no momento.</p>
          </div>
        )}

        {/* Ver Todos Button Mobile */}
        <div className="flex sm:hidden justify-center items-center mt-8">
          <Link
            href="/blog/all"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1565C0] to-[#0D47A1] hover:from-[#0D47A1] hover:to-[#1565C0] text-white font-semibold py-4 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <span>Ver Todos os Posts</span>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
