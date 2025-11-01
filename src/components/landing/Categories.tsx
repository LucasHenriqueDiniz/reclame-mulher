"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const categories = [
  { name: "Saúde", icon: "🏥" },
  { name: "Educação", icon: "📚" },
  { name: "Beleza", icon: "💄" },
  { name: "Tecnologia", icon: "💻" },
  { name: "Alimentação", icon: "🍽️" },
  { name: "Moda", icon: "👗" },
];

export function Categories() {
  return (
    <section className="px-6 py-16 md:py-24 bg-[#F5F5F5]">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-[#190E4F] text-center mb-12"
      >
        Categorias em destaque
      </motion.h3>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            <Link
              href={`/companies?category=${cat.name.toLowerCase()}`}
              className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-all flex flex-col items-center justify-center text-center min-h-[150px] group"
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="text-[#190E4F] font-semibold text-lg">
                {cat.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
