"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface BlogPostCardPost {
  id?: string;
  title: string;
  slug: string;
  coverUrl?: string | null;
  image?: string | null;
  tags?: Array<string | { id?: string; name: string; slug?: string }>;
  author?: {
    name: string;
    avatar?: string | null;
  } | null;
  date?: string | null;
}

interface BlogPostCardProps {
  post: BlogPostCardPost;
  index?: number;
  showAnimation?: boolean;
  showReadMore?: boolean;
}

const FALLBACK_IMAGE = "/blog-image.webp";
const FALLBACK_AUTHOR = {
  name: "Equipe Comunica Mulher",
  avatar: "/blog-avatar.webp",
};

function getInitials(name?: string | null) {
  if (!name) {
    return "?";
  }

  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export function toBlogCardPost(post: {
  id: string;
  title: string;
  slug: string;
  coverUrl?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  tags?: Array<{ id: string; name: string; slug: string }>;
}): BlogPostCardPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    coverUrl: post.coverUrl ?? null,
    tags: post.tags,
    author: FALLBACK_AUTHOR,
    date: new Date(post.publishedAt || post.createdAt).toLocaleDateString("pt-BR"),
  };
}

export function BlogPostCard({
  post,
  index = 0,
  showAnimation = false,
  showReadMore = false,
}: BlogPostCardProps) {
  const postUrl = `/blog/${post.slug}`;
  const imageSrc = post.coverUrl || post.image || FALLBACK_IMAGE;
  const author = post.author ?? FALLBACK_AUTHOR;

  const CardContent = (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={imageSrc}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags?.map((tag, tagIndex) => (
            <Badge
              key={typeof tag === "string" ? `${tag}-${tagIndex}` : `${tag.slug ?? tag.name}-${tagIndex}`}
              variant="secondary"
              className="bg-blue-50 font-medium text-blue-700 hover:bg-blue-100"
            >
              {typeof tag === "string" ? tag : tag.name}
            </Badge>
          ))}
        </div>

        <h3 className="mb-4 line-clamp-2 text-xl font-bold text-[#190E4F] transition-colors group-hover:text-[#3BA5FF] font-heading">
          {post.title}
        </h3>

        <div className="mb-4 flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-blue-100">
            <AvatarImage src={author.avatar ?? undefined} alt={author.name} />
            <AvatarFallback className="bg-[#1E88E5] text-white">
              {getInitials(author.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">{author.name}</span>
            {post.date ? <time className="text-xs text-gray-500">{post.date}</time> : null}
          </div>
        </div>

        {showReadMore ? (
          <div className="mt-auto border-t border-gray-100 pt-4">
            <Button
              variant="ghost"
              className="w-full justify-between text-blue-600 hover:bg-blue-50 hover:text-blue-700 group/btn"
            >
              <span className="font-semibold">Ler mais</span>
              <svg
                className="h-4 w-4 transition-transform group-hover/btn:translate-x-1"
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
            </Button>
          </div>
        ) : null}
      </div>
    </article>
  );

  if (showAnimation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.4 }}
        whileHover={{ y: -8 }}
      >
        <Link href={postUrl} className="group">
          {CardContent}
        </Link>
      </motion.div>
    );
  }

  return (
    <Link href={postUrl} className="group">
      {CardContent}
    </Link>
  );
}
