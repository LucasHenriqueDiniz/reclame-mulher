"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { BlogPostDetailSkeleton } from "@/components/blog/BlogPostDetailSkeleton";
import { useIsAdmin } from "@/hooks/use-auth-state";
import { ArrowLeft, Edit, Plus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";

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

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useIsAdmin();

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/blog/posts/${encodeURIComponent(slug)}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Post não encontrado");
            return;
          }

          throw new Error("Failed to fetch post");
        }

        const data = (await response.json()) as BlogPost;
        setPost(data);
      } catch (error: unknown) {
        setError(getErrorMessage(error, "Erro ao carregar post"));
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50/20 via-white to-blue-50/10">
        <MainHeader />
        
        <div className="flex-1 py-12 px-4 sm:px-6 lg:px-[92px]">
          <BlogPostDetailSkeleton />
        </div>
        
        <div className="py-12"></div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <MainHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Post não encontrado</h1>
            <p className="text-gray-600 mb-6">{error || "O post que você procura não existe."}</p>
            <Link href="/blog" className="text-[#1E88E5] hover:text-[#1976D2]">
              Voltar ao Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50/20 via-white to-blue-50/10">
      <MainHeader />

      <div className="flex-1 py-12 px-4 sm:px-6 lg:px-[92px]">
        <div className="max-w-4xl mx-auto">
          {/* Back Button and Edit */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#1E88E5] hover:text-[#1976D2] font-medium transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
              <span>Voltar</span>
            </Link>
            
            {isAdmin && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => router.push("/blog/new/edit")}
                  className="bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Novo Post</span>
                </Button>
                <Link
                  href={`/blog/${post.slug}/edit`}
                  className="inline-flex items-center gap-2 bg-[#1E88E5] hover:bg-[#1976D2] text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </Link>
              </div>
            )}
          </div>

          {/* Post Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {post.tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center bg-gradient-to-r from-[#1E88E5] to-[#1976D2] text-white text-sm font-medium py-2 px-4 rounded-full"
                >
                  {tag.name}
                </span>
              ))}
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-bold text-[#181A2A] mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-6 text-gray-600">
              <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
          </div>

          {/* Featured Image */}
          {post.coverUrl && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-lg">
              <img
                src={post.coverUrl}
                alt={post.title}
                className="w-full h-[400px] object-cover"
              />
            </div>
          )}

          {/* Post Content */}
          <article className="prose prose-lg max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-4xl font-bold text-[#181A2A] mt-8 mb-4">{children}</h1>,
                h2: ({ children }) => <h2 className="text-3xl font-bold text-[#181A2A] mt-8 mb-4 pb-2 border-b-2 border-gray-200">{children}</h2>,
                h3: ({ children }) => <h3 className="text-2xl font-bold text-[#181A2A] mt-6 mb-3">{children}</h3>,
                p: ({ children }) => <p className="text-xl text-[#3B3C4A] mb-6 leading-relaxed">{children}</p>,
                blockquote: ({ children }) => (
                  <blockquote className="bg-[#F6F6F7] border-l-4 border-[#1E88E5] p-6 my-8 rounded-r-lg">
                    <div className="text-[#181A2A] text-xl italic">{children}</div>
                  </blockquote>
                ),
                ul: ({ children }) => <ul className="list-disc list-inside text-xl text-[#3B3C4A] mb-6 space-y-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside text-xl text-[#3B3C4A] mb-6 space-y-2">{children}</ol>,
                hr: () => <hr className="my-8 border-t-2 border-gray-200" />,
                table: ({ children }) => (
                  <div className="my-8 overflow-x-auto rounded-2xl border border-gray-200">
                    <table className="min-w-full border-collapse bg-white text-left text-base">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-slate-100 text-slate-900">{children}</thead>,
                tbody: ({ children }) => <tbody className="divide-y divide-slate-200">{children}</tbody>,
                tr: ({ children }) => <tr className="divide-x divide-slate-200">{children}</tr>,
                th: ({ children }) => <th className="px-4 py-3 font-semibold">{children}</th>,
                td: ({ children }) => <td className="px-4 py-3 align-top text-[#3B3C4A]">{children}</td>,
                strong: ({ children }) => <strong className="font-bold text-[#181A2A]">{children}</strong>,
                a: ({ children, href }) => (
                  <a href={href} className="text-[#1E88E5] hover:text-[#1976D2] underline">
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => (
                  <img src={src} alt={alt || ""} className="w-full rounded-xl my-8" />
                ),
              }}
            >
              {post.contentMd || "Conteúdo não disponível."}
            </ReactMarkdown>
          </article>

          {/* Back Button Bottom */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-[#1E88E5] hover:text-[#1976D2] font-medium transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 transform group-hover:-translate-x-1 transition-transform" />
              <span>Voltar ao Blog</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="py-12"></div>

      <Footer />
    </div>
  );
}
