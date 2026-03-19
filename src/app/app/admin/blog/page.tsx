"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createBlogPost, deleteBlogPost, updateBlogPost, type BlogPost } from "@/hooks/use-blog";

interface BlogPostsResponse {
  posts?: BlogPost[];
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminBlogPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pendingPostId, setPendingPostId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPosts() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/blog/posts?scope=admin&limit=50", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Nao foi possivel carregar os posts");
      }

      const data = (await response.json()) as BlogPostsResponse;
      setPosts(data.posts || []);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Erro ao carregar posts"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPosts();
  }, []);

  const handleCreatePost = async () => {
    try {
      setSubmitting(true);
      setError(null);

      await createBlogPost({
        title,
        slug: slug || slugify(title),
        content_md: content,
        content,
        excerpt: content.slice(0, 180),
        status: "DRAFT",
      });

      setTitle("");
      setSlug("");
      setContent("");
      setIsCreateOpen(false);
      await loadPosts();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Erro ao criar post"));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (post: BlogPost) => {
    try {
      setPendingPostId(post.id);
      setError(null);
      await updateBlogPost(post.id, {
        status: "PUBLISHED",
        published_at: new Date(),
      });
      await loadPosts();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Erro ao publicar post"));
    } finally {
      setPendingPostId(null);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      setPendingPostId(postId);
      setError(null);
      await deleteBlogPost(postId);
      await loadPosts();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Erro ao excluir post"));
    } finally {
      setPendingPostId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl mb-2">CMS - Blog</h1>
          <p className="text-gray-600">Gerencie os posts do blog</p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/app/admin/blog/help">Ajuda de Markdown</Link>
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>Criar Post</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Post</DialogTitle>
                <DialogDescription>Crie um novo post para o blog</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titulo</Label>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="meu-novo-post"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Conteudo</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={10}
                  />
                </div>
                <Button
                  onClick={handleCreatePost}
                  className="w-full"
                  disabled={submitting || !title.trim() || !content.trim()}
                >
                  {submitting ? "Criando..." : "Criar Post"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Carregando posts...</p>
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-gray-600">
          Nenhum post encontrado.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="rounded-xl border p-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-heading text-lg mb-1">{post.title}</h3>
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-semibold">{post.status}</span>
                  </p>
                  <p className="text-sm text-gray-600">Slug: {post.slug}</p>
                  <p className="text-sm text-gray-600">
                    Atualizado: {new Date(post.updatedAt || post.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.status !== "PUBLISHED" && (
                    <Button
                      size="sm"
                      onClick={() => handlePublish(post)}
                      disabled={pendingPostId === post.id}
                    >
                      {pendingPostId === post.id ? "Publicando..." : "Publicar"}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/blog/${post.slug}/edit`}>Editar</Link>
                  </Button>
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/blog/${post.slug}`}>Ver</Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(post.id)}
                    disabled={pendingPostId === post.id}
                  >
                    {pendingPostId === post.id ? "Excluindo..." : "Excluir"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
