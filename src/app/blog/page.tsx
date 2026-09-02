"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { BlogPostCard, toBlogCardPost } from "@/components/blog/BlogPostCard";
import { BlogPostCardSkeleton } from "@/components/blog/BlogPostCardSkeleton";
import { useIsAdmin } from "@/hooks/use-auth-state";
import { Plus } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  contentMd: string | null;
  excerpt: string | null;
  coverUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  tags?: Array<{ id: string; name: string; slug: string }>;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useIsAdmin();

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const response = await fetch("/api/blog/posts?limit=10");
        
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 10);

  if (loading) {
    return (
      <div className="flex flex-col bg-gradient-to-b from-white via-blue-50/30 to-white min-h-screen">
        <MainHeader />
        
        <div className="self-stretch py-12 px-4 sm:px-6 lg:px-[92px]">
          {/* Featured Post Skeleton */}
          <div className="flex flex-col items-start self-stretch relative pb-[104px] mb-20 animate-pulse">
            <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_200%] animate-shimmer" />
            <div className="flex flex-col items-start bg-white absolute bottom-0 left-4 sm:left-16 py-8 px-8 max-w-[600px] rounded-2xl border border-solid border-gray-100 shadow-2xl">
              <div className="flex gap-3 mb-4">
                <div className="h-8 w-24 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-full" />
                <div className="h-8 w-32 bg-gradient-to-r from-blue-200 via-blue-100 to-blue-200 rounded-full" />
              </div>
              <div className="space-y-3 mb-6 w-full">
                <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full" />
                <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-4/5" />
              </div>
              <div className="h-5 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded" />
            </div>
          </div>

          {/* Recent Posts Section Skeleton */}
          <div className="flex flex-col self-stretch gap-10">
            <div className="flex justify-between items-center self-stretch flex-wrap gap-4 animate-pulse">
              <div>
                <div className="h-9 w-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded mb-2" />
                <div className="h-6 w-80 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded" />
              </div>
              <div className="h-10 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-lg" />
            </div>

            {/* Blog Grid Skeleton */}
            <div className="flex flex-col self-stretch gap-6">
              {[0, 1, 2].map((rowIndex) => (
                <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[0, 1, 2].map((colIndex) => (
                    <BlogPostCardSkeleton key={`${rowIndex}-${colIndex}`} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-12"></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gradient-to-b from-white via-blue-50/30 to-white min-h-screen">
      <MainHeader />
      
      <div className="self-stretch py-12 px-4 sm:px-6 lg:px-[92px]">
        {/* Featured Post */}
        {featuredPost && (
          <div className="flex flex-col items-start self-stretch relative pb-[104px] mb-20">
            <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={featuredPost.coverUrl || "/blog-image.webp"}
                alt={featuredPost.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>
            <div
              className="flex flex-col items-start bg-white absolute bottom-0 left-4 sm:left-16 py-8 px-8 max-w-[600px] rounded-2xl border border-solid border-gray-100 shadow-2xl"
            >
              <div className="flex items-center mb-4 gap-3 flex-wrap">
                {featuredPost.tags?.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center bg-gradient-to-r from-[#1E88E5] to-[#1976D2] text-white text-sm font-medium py-2 px-4 rounded-full shadow-md"
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
                className="hidden sm:flex shrink-0 items-center gap-2 text-[#1E88E5] hover:text-[#1976D2] font-semibold transition-colors group"
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

          {/* "Ver Todos" (see all) button, mobile */}
          <div className="flex sm:hidden justify-center items-center mt-8">
            <Link
              href="/blog/all"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1E88E5] to-[#1976D2] hover:from-[#1976D2] hover:to-[#1565C0] text-white font-semibold py-4 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

      <div className="py-12"></div>

      <Footer />
    </div>
  );
}
