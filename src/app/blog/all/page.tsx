"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { BlogPostCard, toBlogCardPost } from "@/components/blog/BlogPostCard";
import { BlogPostCardSkeleton } from "@/components/blog/BlogPostCardSkeleton";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, ArrowLeft } from "lucide-react";

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

interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

export default function AllBlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch posts
        const postsResponse = await fetch("/api/blog/posts?limit=100");
        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(postsData.posts || []);
        }

        // Fetch tags
        const tagsResponse = await fetch("/api/blog/tags");
        if (tagsResponse.ok) {
          const tagsData = await tagsResponse.json();
          setTags(tagsData || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const toggleTag = (tagSlug: string) => {
    setSelectedTags(prev =>
      prev.includes(tagSlug)
        ? prev.filter(t => t !== tagSlug)
        : [...prev, tagSlug]
    );
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      // Search filter
      const matchesSearch = searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Tag filter
      const matchesTags = selectedTags.length === 0 ||
        post.tags?.some(tag => selectedTags.includes(tag.slug));

      return matchesSearch && matchesTags;
    });
  }, [posts, searchQuery, selectedTags]);

  if (loading) {
    return (
      <div className="flex flex-col bg-gradient-to-b from-blue-50/30 via-white to-blue-50/20 min-h-screen">
        <MainHeader />
        
        <div className="flex-1 py-12 px-4 sm:px-6 lg:px-[92px]">
          <div className="max-w-7xl mx-auto">
            {/* Back Button Skeleton */}
            <div className="mb-6 animate-pulse">
              <div className="h-6 w-32 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded" />
            </div>

            {/* Header Skeleton */}
            <div className="mb-10 animate-pulse">
              <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-80 mb-4" />
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-96" />
            </div>

            {/* Search and Filters Skeleton */}
            <div className="mb-10 space-y-4 animate-pulse">
              <div className="h-14 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl" />
              <div className="flex items-center justify-between">
                <div className="h-6 w-40 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded" />
                <div className="h-5 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded" />
              </div>
            </div>

            {/* Posts Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[...Array(6)].map((_, i) => (
                <BlogPostCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gradient-to-b from-blue-50/30 via-white to-blue-50/20 min-h-screen">
      <MainHeader />

      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-[92px]">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[#1E88E5] hover:text-[#1976D2] font-medium mb-6 transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
            <span>Voltar ao Blog</span>
          </Link>

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-[#181A2A] text-4xl sm:text-5xl font-bold mb-4">
              Todos os Posts
            </h1>
            <p className="text-gray-600 text-lg">
              Explore todos os nossos conteúdos sobre direitos, processos e boas práticas
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-10 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar por título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-base border-2 border-gray-200 focus:border-[#1E88E5] rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white"
              />
            </div>

            {/* Filter Toggle Button */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-[#1E88E5] hover:text-[#1976D2] font-semibold transition-colors"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span>{showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}</span>
                {selectedTags.length > 0 && (
                  <Badge className="bg-[#1E88E5] text-white">
                    {selectedTags.length}
                  </Badge>
                )}
              </button>
              
              {/* Results Count */}
              <p className="text-gray-600 text-sm">
                {filteredPosts.length === posts.length
                  ? `${posts.length} posts`
                  : `${filteredPosts.length} de ${posts.length} posts`}
              </p>
            </div>

            {/* Tags Filter */}
            {showFilters && (
              <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-[#181A2A] text-lg">Filtrar por Tags</h3>
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      className="text-sm text-[#1E88E5] hover:text-[#1976D2] font-medium transition-colors"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      onClick={() => toggleTag(tag.slug)}
                      className={`cursor-pointer transition-all text-sm py-2 px-4 ${
                        selectedTags.includes(tag.slug)
                          ? "bg-gradient-to-r from-[#1E88E5] to-[#1976D2] text-white hover:from-[#1976D2] hover:to-[#1565C0] shadow-md"
                          : "bg-white text-[#1E88E5] border-2 border-[#1E88E5] hover:bg-blue-50"
                      }`}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Posts Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredPosts.map((post) => (
                <BlogPostCard key={post.id} post={toBlogCardPost(post)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="text-gray-300 mb-6">
                <Search className="h-20 w-20 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-[#181A2A] mb-3">
                Nenhum post encontrado
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                Tente ajustar seus filtros ou termo de busca
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTags([]);
                }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1E88E5] to-[#1976D2] hover:from-[#1976D2] hover:to-[#1565C0] text-white font-semibold py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg"
              >
                Limpar todos os filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="py-12"></div>

      <Footer />
    </div>
  );
}
