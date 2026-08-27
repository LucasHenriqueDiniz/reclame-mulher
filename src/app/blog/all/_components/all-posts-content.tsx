"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { BlogPostCard, toBlogCardPost } from "@/components/blog/BlogPostCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, ArrowLeft } from "lucide-react";
import type { PostDoBlog, TagDoBlog } from "../../_lib/posts";

/**
 * Busca e filtro continuam no cliente — são interação, não carregamento. O que
 * saiu daqui foi a busca de dados: posts e tags chegam prontos do servidor, e
 * com eles some o esqueleto que trocava a página inteira (cabeçalho e rodapé
 * inclusive) durante o carregamento.
 */
export function AllPostsContent({ posts, tags }: { posts: PostDoBlog[]; tags: TagDoBlog[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleTag = (tagSlug: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagSlug) ? prev.filter((t) => t !== tagSlug) : [...prev, tagSlug]
    );
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Filtro de busca
      const matchesSearch =
        searchQuery === "" || post.title.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro de tags
      const matchesTags =
        selectedTags.length === 0 || post.tags?.some((tag) => selectedTags.includes(tag.slug));

      return matchesSearch && matchesTags;
    });
  }, [posts, searchQuery, selectedTags]);

  return (
    <div className="flex-1 py-12 px-4 sm:px-6 lg:px-[92px]">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-[#1565C0] hover:text-[#0D47A1] font-medium mb-6 transition-colors group"
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
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            <Input
              type="text"
              placeholder="Buscar por título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-base border-2 border-gray-200 focus:border-[#1565C0] rounded-xl shadow-sm hover:shadow-md transition-shadow bg-white"
            />
          </div>

          {/* Filter Toggle Button */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-[#1565C0] hover:text-[#0D47A1] font-semibold transition-colors"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>{showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}</span>
              {selectedTags.length > 0 && (
                <Badge className="bg-[#1565C0] text-white">
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
                    className="text-sm text-[#1565C0] hover:text-[#0D47A1] font-medium transition-colors"
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
                        ? "bg-gradient-to-r from-[#1565C0] to-[#0D47A1] text-white hover:from-[#0D47A1] hover:to-[#1565C0] shadow-md"
                        : "bg-white text-[#1565C0] border-2 border-[#1565C0] hover:bg-blue-50"
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
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1565C0] to-[#0D47A1] hover:from-[#0D47A1] hover:to-[#1565C0] text-white font-semibold py-3 px-6 rounded-full transition-all shadow-md hover:shadow-lg"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
