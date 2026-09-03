"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FileEdit, Eye, Image as ImageIcon, Upload } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { createBlogPost, updateBlogPost, type BlogPost } from "@/hooks/use-blog";
import { FeaturedImageField } from "./_components/featured-image-field";
import { PostPreview } from "./_components/post-preview";
import { MarkdownToolbar } from "./_components/markdown-toolbar";
import { TagInput } from "./_components/tag-input";
import { createSlugFromTitle, getErrorMessage } from "./_components/edit-post-helpers";

export default function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const isNew = slug === "new";
  const [postId, setPostId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [author, setAuthor] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  // Only the editor drop uses this now; the cover field owns its own.
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { startUpload } = useUploadThing("blogImage");

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }

    async function fetchPost() {
      try {
        setLoading(true);
        setLoadError(null);

        const response = await fetch(`/api/blog/posts/${encodeURIComponent(slug)}`);
        if (!response.ok) {
          throw new Error("Não foi possível carregar o post");
        }

        const post: BlogPost = await response.json();
        setPostId(post.id);
        setTitle(post.title ?? "");
        setContent(post.contentMd || post.content || "");
        setFeaturedImage(post.coverUrl || "");
        setTags(post.tags?.map((tag) => tag.name) || []);
      } catch (error: unknown) {
        setLoadError(getErrorMessage(error, "Erro ao carregar post"));
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [isNew, slug]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      const nextSlug = createSlugFromTitle(title);
      if (isNew && !nextSlug) {
        setSaveError("Informe um titulo para gerar o slug do post.");
        return;
      }

      const savedPost = isNew
        ? await createBlogPost({
            title,
            slug: nextSlug,
            content,
            content_md: content,
            excerpt: content.slice(0, 180),
            cover_url: featuredImage || undefined,
            tag_names: tags,
          })
        : await updateBlogPost(postId || slug, {
            title,
            content,
            content_md: content,
            excerpt: content.slice(0, 180),
            cover_url: featuredImage || undefined,
            tag_names: tags,
          });

      router.push(`/blog/${savedPost.slug}`);
    } catch (error: unknown) {
      setSaveError(getErrorMessage(error, "Erro ao salvar post"));
    } finally {
      setSaving(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith("image/"));

    if (!imageFile) {
      setSaveError("Por favor, arraste apenas arquivos de imagem.");
      return;
    }

    try {
      setUploading(true);
      const result = await startUpload([imageFile]);
      
      if (result && result[0]) {
        const imageUrl = result[0].ufsUrl || result[0].url;
        const textarea = document.querySelector("textarea");
        
        if (textarea) {
          const cursorPos = textarea.selectionStart;
          const before = content.substring(0, cursorPos);
          const after = content.substring(cursorPos);
          const imageMarkdown = `![${imageFile.name}](${imageUrl})`;
          
          setContent(before + imageMarkdown + after);
          
          setTimeout(() => {
            textarea.focus();
            const newPos = cursorPos + imageMarkdown.length;
            textarea.setSelectionRange(newPos, newPos);
          }, 0);
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setSaveError("Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50/20 to-white">
      <MainHeader />

      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-[92px]">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#181A2A] mb-2">
              {isNew ? "Criar Novo Post" : "Editar Post"}
            </h1>
            <p className="text-gray-600">
              Use Markdown para formatar seu conteúdo
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-8 text-gray-600 shadow-lg">
              Carregando post...
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {loadError}
            </div>
          ) : (
            <>
          {saveError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {saveError}
            </div>
          )}

          {/* Editor Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("edit")}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors ${
                  activeTab === "edit"
                    ? "border-[#1E88E5] text-[#1E88E5]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <FileEdit className="h-5 w-5" />
                <span className="font-medium">Editar</span>
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors ${
                  activeTab === "preview"
                    ? "border-[#1E88E5] text-[#1E88E5]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Eye className="h-5 w-5" />
                <span className="font-medium">Preview</span>
              </button>
              <Link
                href="/app/admin/blog/help"
                className="ml-auto text-sm text-[#1E88E5] hover:text-[#1976D2]"
              >
                Ajuda de Markdown
              </Link>
            </div>

            {activeTab === "edit" ? (
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-[#1E0D62] mb-2">
                    Título
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Digite o título do post"
                    className="text-base"
                  />
                </div>

                {/* Markdown Toolbar */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-[#1E0D62]">
                      Artigo
                    </label>
                  </div>
                  
                    <MarkdownToolbar content={content} onChange={setContent} />

                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className="relative"
                  >
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Escreva seu conteúdo em Markdown..."
                      className={`min-h-[500px] font-mono text-sm rounded-t-none border-gray-200 ${
                        dragActive ? "border-[#1E88E5] border-2 bg-blue-50/50" : ""
                      }`}
                    />
                    {dragActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 border-2 border-dashed border-[#1E88E5] rounded-b-xl pointer-events-none">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 text-[#1E88E5] mx-auto mb-2" />
                          <p className="text-[#1E88E5] font-medium">Solte a imagem aqui</p>
                        </div>
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-b-xl">
                        <div className="text-center">
                          <Upload className="h-12 w-12 text-[#1E88E5] mx-auto mb-2 animate-pulse" />
                          <p className="text-[#1E88E5] font-medium">Fazendo upload...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                  <TagInput tags={tags} onChange={setTags} />

                {/* Author */}
                <div>
                  <label className="block text-sm font-bold text-[#1E0D62] mb-2">
                    Autor
                  </label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Nome do autor"
                    disabled
                  />
                </div>

                  <FeaturedImageField
                    value={featuredImage}
                    onChange={setFeaturedImage}
                    onError={setSaveError}
                  />
              </div>
            ) : (
                <PostPreview title={title} content={content} />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="px-6"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-[#1E88E5] hover:bg-[#1976D2] text-white px-6"
              disabled={saving || !title.trim() || !content.trim()}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
            </>
          )}
        </div>
      </div>

      <div className="py-8"></div>

      <Footer />
    </div>
  );
}
