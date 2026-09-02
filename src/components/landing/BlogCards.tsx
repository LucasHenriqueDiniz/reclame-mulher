"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BlogPostCard, toBlogCardPost, type BlogPostCardPost } from "@/components/blog/BlogPostCard";

export function BlogCards() {
  const [posts, setPosts] = useState<BlogPostCardPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/blog/posts?limit=3");
        if (!res.ok) return;
        const data = (await res.json()) as { posts: Array<Parameters<typeof toBlogCardPost>[0]> };
        setPosts(data.posts.map(toBlogCardPost));
      } catch {
        // silent: the landing page must not break when the blog fails
      } finally {
        setLoading(false);
      }
    }
    void fetchPosts();
  }, []);

  return (
    <section className="flex flex-col items-center justify-center gap-14 px-6 md:px-[100px] py-[75px] w-full bg-brand-blue">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="font-heading font-bold text-white text-3xl md:text-4xl lg:text-5xl text-center mb-4">
          Recursos para empoderar sua comunidade
        </h2>

        <p className="font-medium text-lg md:text-xl text-center text-white/80 max-w-2xl mx-auto">
          Conteúdos informativos sobre direitos, processos e boas práticas
        </p>
      </motion.header>

      <div className="grid md:grid-cols-3 w-full max-w-7xl mx-auto gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-96 w-full animate-pulse rounded-2xl bg-white/10"
              />
            ))
          : posts.map((post, index) => (
              <BlogPostCard
                key={post.slug}
                post={post}
                index={index}
                showAnimation={true}
                showReadMore={true}
              />
            ))}
      </div>
    </section>
  );
}
