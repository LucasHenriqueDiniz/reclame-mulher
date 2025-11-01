"use client";

import { motion } from "framer-motion";
import { MapPin, Shield, TreePine, Building2, TrendingUp, Plus } from "lucide-react";

const categories = [
  {
    icon: MapPin,
    title: "DESLOCAMENTO E MOBILIDADE",
    description:
      "Impactos no seu direito de ir e vir, reassentamentos e alterações em rotas de transporte.",
  },
  {
    icon: Shield,
    title: "SEGURANÇA COMUNITÁRIA",
    description:
      "Questões relacionadas à segurança pessoal e familiar durante e após as obras.",
  },
  {
    icon: TreePine,
    title: "IMPACTO AMBIENTAL",
    description:
      "Problemas com poluição, ruído, poeira e danos aos recursos naturais locais.",
  },
  {
    icon: Building2,
    title: "INFRAESTRUTURA COMUNITÁRIA",
    description:
      "Danos ou melhorias necessárias em escolas, centros comunitários e espaços públicos.",
  },
  {
    icon: TrendingUp,
    title: "ECONOMIA LOCAL",
    description:
      "Impactos no comércio, empregos e oportunidades de renda para mulheres.",
  },
  {
    icon: Plus,
    title: "OUTRAS PREOCUPAÇÕES",
    description:
      "Questões específicas que não se encaixam nas categorias anteriores.",
  },
];

export function ImpactCategories() {
  return (
    <section className="bg-brand-blue">
      {/* Content */}
      <div className="px-6 md:px-[100px] py-[25px] md:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 md:mb-16"
          >
            <h3 className="font-heading font-bold text-white text-3xl md:text-4xl lg:text-5xl text-center mb-4">
              Áreas de impacto que podemos ajudar
            </h3>
            <p className="font-medium text-white/80 text-lg md:text-xl text-center max-w-[716px] mx-auto">
              Selecione a categoria que melhor descreve sua situação
            </p>
          </motion.div>

          {/* Categories Grid */}
          <div className="grid md:grid-cols-2 gap-[30px] w-full max-w-[770px] mx-auto">
            {categories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                  className="w-full h-[270px] bg-transparent border-2 border-white rounded-2xl cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <div className="p-0 h-full flex flex-col">
                    <div className="pt-[41px] pl-[39px] pb-4">
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <div className="px-[39px] pb-[41px] flex-1 flex flex-col justify-center">
                      <h3 className="font-bold text-white text-sm tracking-[2px] leading-[26px] uppercase mb-3">
                        {category.title}
                      </h3>
                      <p className="opacity-80 font-normal text-white text-base leading-[26px]">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
