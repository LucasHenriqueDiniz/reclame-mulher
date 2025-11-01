"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const partners = [
  { name: "Marca A", verified: true },
  { name: "Marca B", verified: true },
  { name: "Marca C", verified: false },
  { name: "Marca D", verified: true },
];

export function Partners() {
  return (
    <section className="px-6 py-16 md:py-24 bg-white text-center">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-[#190E4F] mb-12"
      >
        Empresas que escutam
      </motion.h3>
      <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
        {partners.map((brand, i) => (
          <motion.div
            key={brand.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            <Link
              href={`/companies/${brand.name.toLowerCase().replace(" ", "-")}`}
              className="bg-[#F5F5F5] px-8 py-4 rounded-lg text-[#190E4F] font-semibold hover:bg-[#3BA5FF] hover:text-white transition-all inline-flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              {brand.name}
              {brand.verified && (
                <span className="text-[#3BA5FF] group-hover:text-white" title="Verificada">
                  ✓
                </span>
              )}
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
