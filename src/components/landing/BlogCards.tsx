"use client";

import { motion } from "framer-motion";
import { BlogPostCard, type BlogPostCardPost } from "@/components/blog/BlogPostCard";

const cardsData: BlogPostCardPost[] = [
  {
    image: "/blog-image.webp",
    tags: ["Políticas Públicas", "Legislação"],
    title: "Políticas Públicas para Mulheres Impactadas",
    author: {
      name: "Maria Silva",
      avatar: "/blog-avatar.webp",
    },
    date: "20 de Agosto, 2024",
    slug: "politicas-publicas-mulheres-impactadas",
  },
  {
    image: "/blog-image-2.webp",
    tags: ["Direitos Essenciais", "Recursos Hídricos"],
    title: "Acesso à Água em Áreas de Reassentamento",
    author: {
      name: "Ana Santos",
      avatar: "/blog-avatar.webp",
    },
    date: "15 de Agosto, 2024",
    slug: "acesso-agua-reassentamento",
  },
  {
    image: "/blog-image-3.webp",
    tags: ["Participação Social", "Casos de Sucesso"],
    title: "Participação Social Feminina: Como Mulheres Transformaram Projetos",
    author: {
      name: "Carla Oliveira",
      avatar: "/blog-avatar.webp",
    },
    date: "10 de Agosto, 2024",
    slug: "participacao-social-feminina",
  },
];

export function BlogCards() {
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
        {cardsData.map((card, index) => (
          <BlogPostCard 
            key={index}
            post={card}
            index={index}
            showAnimation={true}
            showReadMore={true}
          />
        ))}
      </div>
    </section>
  );
}
