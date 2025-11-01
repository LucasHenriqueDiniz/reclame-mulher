"use client";

import { useState } from "react";
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

export default function AdminBlogPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [slug, setSlug] = useState("");

  const handleCreatePost = () => {
    // TODO: [API: POST /api/admin/blog/posts]
    alert("Criar post será implementado");
    setIsCreateOpen(false);
  };

  const handlePublish = (postId: string) => {
    // TODO: [API: PATCH /api/admin/blog/posts/[id]/publish]
    alert(`Publicar post ${postId} será implementado`);
  };

  const handleDelete = (postId: string) => {
    // TODO: [API: DELETE /api/admin/blog/posts/[id]]
    alert(`Deletar post ${postId} será implementado`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-heading text-3xl mb-2">CMS - Blog</h1>
          <p className="text-gray-600">
            Gerencie os posts do blog
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Criar Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Post</DialogTitle>
              <DialogDescription>
                Crie um novo post para o blog
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
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
                <Label htmlFor="content">Conteúdo</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                />
                <p className="text-sm text-gray-500 mt-1">
                  [Usar editor Markdown/WYSIWYG no futuro]
                </p>
              </div>
              <Button onClick={handleCreatePost} className="w-full">
                Criar Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600 mb-4">
          [API: GET /api/admin/blog/posts?page=1]
        </p>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-heading text-lg mb-1">Post {i}</h3>
                <p className="text-sm text-gray-600">
                  Status: <span className="font-semibold">Rascunho</span>
                </p>
                <p className="text-sm text-gray-600">
                  Slug: post-{i}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handlePublish(`post-${i}`)}
                >
                  Publicar
                </Button>
                <Button size="sm" variant="outline">
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(`post-${i}`)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 mt-6">
        [API: POST /api/admin/blog/posts - Criar]
        <br />
        [API: PATCH /api/admin/blog/posts/[id] - Editar]
        <br />
        [API: PATCH /api/admin/blog/posts/[id]/publish - Publicar]
        <br />
        [API: DELETE /api/admin/blog/posts/[id] - Excluir]
      </p>
    </div>
  );
}

