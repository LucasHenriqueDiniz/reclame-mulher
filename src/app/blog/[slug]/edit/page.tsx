"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileEdit, 
  Eye, 
  X, 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Upload
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useUploadThing } from "@/lib/uploadthing";
import { createBlogPost, updateBlogPost, type BlogPost } from "@/hooks/use-blog";

interface UploadResultItem {
  ufsUrl?: string | null;
  url?: string | null;
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function createSlugFromTitle(value: string) {
  return value.toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "");
}

export default function EditBlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const isNew = slug === "new";
  const [postId, setPostId] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [author, setAuthor] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
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

  const insertMarkdown = (syntax: string, placeholder: string = "") => {
    const textarea = document.querySelector("textarea");
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || placeholder;
    const before = content.substring(0, start);
    const after = content.substring(end);

    let newText = "";
    let cursorOffset = 0;

    switch (syntax) {
      case "bold":
        newText = `${before}**${selectedText}**${after}`;
        cursorOffset = selectedText ? 2 : 2 + placeholder.length;
        break;
      case "italic":
        newText = `${before}*${selectedText}*${after}`;
        cursorOffset = selectedText ? 1 : 1 + placeholder.length;
        break;
      case "h1":
        newText = `${before}\n# ${selectedText || "Título"}${after}`;
        cursorOffset = selectedText ? 3 : 3 + 6;
        break;
      case "h2":
        newText = `${before}\n## ${selectedText || "Subtítulo"}${after}`;
        cursorOffset = selectedText ? 4 : 4 + 10;
        break;
      case "quote":
        newText = `${before}\n> ${selectedText || "Citação"}${after}`;
        cursorOffset = selectedText ? 3 : 3 + 8;
        break;
      case "ul":
        newText = `${before}\n- ${selectedText || "Item"}${after}`;
        cursorOffset = selectedText ? 3 : 3 + 4;
        break;
      case "ol":
        newText = `${before}\n1. ${selectedText || "Item"}${after}`;
        cursorOffset = selectedText ? 4 : 4 + 4;
        break;
      case "link":
        newText = `${before}[${selectedText || "texto"}](url)${after}`;
        cursorOffset = selectedText ? selectedText.length + 3 : 9;
        break;
      case "image":
        newText = `${before}![${selectedText || "alt"}](url)${after}`;
        cursorOffset = selectedText ? selectedText.length + 4 : 9;
        break;
      case "code":
        newText = `${before}\`${selectedText || "código"}\`${after}`;
        cursorOffset = selectedText ? 1 : 1 + 7;
        break;
      case "hr":
        newText = `${before}\n\n---\n\n${after}`;
        cursorOffset = 6;
        break;
      default:
        return;
    }

    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + cursorOffset, start + cursorOffset);
    }, 0);
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = (await startUpload([file])) as UploadResultItem[] | undefined;
      
      if (result && result[0]) {
        setFeaturedImage(result[0].ufsUrl || result[0].url || "");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setSaveError("Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
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
                  
                  <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 rounded-t-xl border border-b-0 border-gray-200">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("bold", "texto em negrito")}
                      title="Negrito"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("italic", "texto em itálico")}
                      title="Itálico"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("h1")}
                      title="Título H1"
                    >
                      <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("h2")}
                      title="Título H2"
                    >
                      <Heading2 className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("ul")}
                      title="Lista"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("ol")}
                      title="Lista Numerada"
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("quote")}
                      title="Citação"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("code")}
                      title="Código"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-gray-300 mx-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("link")}
                      title="Link"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("image")}
                      title="Imagem"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>

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

                {/* Tags */}
                <div>
                  <label className="block text-sm font-bold text-[#1E0D62] mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap items-center gap-2 p-3 border border-gray-200 rounded-xl">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        className="bg-[#1E88E5] text-white flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:bg-white/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                      placeholder="Adicionar tag..."
                      className="flex-1 min-w-[150px] border-0 focus-visible:ring-0 p-0 h-auto"
                    />
                  </div>
                </div>

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

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-bold text-[#1E0D62] mb-2">
                    Foto de showcase
                  </label>
                  <div className="space-y-3">
                    {featuredImage && (
                      <div className="border-2 border-[#1E88E5] rounded-xl p-2">
                        <img
                          src={featuredImage}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex gap-3">
                      <Input
                        value={featuredImage}
                        onChange={(e) => setFeaturedImage(e.target.value)}
                        placeholder="URL da imagem"
                        className="flex-1"
                      />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={uploading}
                          asChild
                        >
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? "Enviando..." : "Upload"}
                          </span>
                        </Button>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                <h1 className="text-4xl font-bold text-[#181A2A] mb-6">{title}</h1>
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
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
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
