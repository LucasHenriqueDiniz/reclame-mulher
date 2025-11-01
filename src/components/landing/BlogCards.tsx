"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const cardsData = [
  {
    image: "/blog-image.webp",
    tags: ["Políticas Públicas", "Legislação"],
    title: "Políticas Públicas para Mulheres Impactadas",
    authorImage: "/blog-avatar.webp",
    authorName: "Maria Silva",
    date: "20 de Agosto, 2024",
    slug: "politicas-publicas-mulheres-impactadas",
  },
  {
    image: "/blog-image-2.webp",
    tags: ["Direitos Essenciais", "Recursos Hídricos"],
    title: "Acesso à Água em Áreas de Reassentamento",
    authorImage: "/blog-avatar.webp",
    authorName: "Ana Santos",
    date: "15 de Agosto, 2024",
    slug: "acesso-agua-reassentamento",
  },
  {
    image: "/blog-image-3.webp",
    tags: ["Participação Social", "Casos de Sucesso"],
    title:
      "Participação Social Feminina: Como Mulheres Transformaram Projetos",
    authorImage: "/blog-avatar.webp",
    authorName: "Carla Oliveira",
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
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -8 }}
          >
            <Link href={`/blog/${card.slug}`} className="group">
              <article className="flex flex-col h-full bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
                {/* Image Section */}
                <div className="relative w-full h-64 overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content Section */}
                <div className="flex flex-col flex-1 p-6">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {card.tags.map((tag, tagIndex) => (
                      <Badge
                        key={tagIndex}
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-bold text-[#190E4F] text-xl mb-4 line-clamp-2 group-hover:text-[#3BA5FF] transition-colors">
                    {card.title}
                  </h3>

                  {/* Author & Date */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-10 h-10 border-2 border-blue-100">
                      <AvatarImage src={card.authorImage} alt={card.authorName} />
                      <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold">
                        {card.authorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 text-sm">
                        {card.authorName}
                      </span>
                      <time className="text-gray-500 text-xs">
                        {card.date}
                      </time>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <Button
                      variant="ghost"
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 w-full justify-between group/btn"
                    >
                      <span className="font-semibold">Ler mais</span>
                      <svg
                        className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform"
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
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
