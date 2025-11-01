"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const articles = [
  {
    title: "Como reclamar com impacto",
    author: "Ana Souza",
    excerpt: "Aprenda técnicas eficazes para fazer reclamações que realmente fazem diferença.",
    slug: "como-reclamar-com-impacto",
  },
  {
    title: "5 direitos que você tem e não sabia",
    author: "Mariana Lima",
    excerpt: "Descubra direitos do consumidor que podem te ajudar no dia a dia.",
    slug: "5-direitos-que-voce-tem",
  },
  {
    title: "Empresas que ouviram",
    author: "Juliana Dias",
    excerpt: "Conheça histórias de sucesso de mulheres que conseguiram resolver suas reclamações.",
    slug: "empresas-que-ouviram",
  },
];

export function ArticlesCarousel() {
  return (
    <section className="px-6 py-16 md:py-24 bg-[#F5F5F5]">
      <div className="max-w-6xl mx-auto">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-bold text-[#190E4F] mb-12 text-center"
        >
          Últimos artigos
        </motion.h3>
        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all"
            >
              <h4 className="text-[#190E4F] font-semibold text-lg mb-2">
                {post.title}
              </h4>
              <p className="text-sm text-[#190E4F]/70 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#190E4F]/50">por {post.author}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-[#3BA5FF] hover:text-[#2d8ddf] text-sm font-medium flex items-center gap-1"
                >
                  Ler mais
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-8"
        >
          <Link
            href="/blog"
            className="text-[#3BA5FF] hover:text-[#2d8ddf] font-semibold inline-flex items-center gap-2"
          >
            Ver todos os artigos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
