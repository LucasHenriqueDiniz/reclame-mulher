"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";
import { useHeaderData } from "@/lib/stores/header-data-store";

export function BlogDropdown() {
  const { posts, isLoading } = useHeaderData();

  if (isLoading) {
    return (
      <div className="w-[700px] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[700px] p-6">
      <div className="mb-4">
        <h3 className="font-['Poppins'] text-lg font-bold text-[#2A3F54] mb-2">
          Posts em Destaque
        </h3>
        <p className="font-['Poppins'] text-sm text-[#607D8B]">
          Conteúdos recentes sobre direitos e participação comunitária
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="block group"
          >
            <div className="rounded-lg overflow-hidden border border-[#E5E5ED] hover:border-[#1E88E5] transition-all hover:shadow-lg">
              <div className="relative h-32 bg-gray-100">
                <Image
                  src={post.imageUrl}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-[#1E88E5] text-white text-[10px] font-['Poppins'] font-bold rounded">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h4 className="font-['Poppins'] font-semibold text-sm text-[#2A3F54] mb-2 line-clamp-2 group-hover:text-[#1E88E5] transition-colors">
                  {post.title}
                </h4>
                <p className="font-['Poppins'] text-xs text-[#607D8B] line-clamp-2 mb-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-[#607D8B] font-['Poppins']">
                  <Clock className="w-3 h-3" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/blog"
        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-lg font-['Poppins'] font-semibold text-sm transition-colors"
      >
        Ver todos os posts
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
