"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2 } from "lucide-react";

const PLACEHOLDER_SLOTS = 4;

export function PartnersSection() {
  return (
    <section className="flex flex-col w-full items-center gap-[52px] px-6 md:px-[115px] py-16 md:py-[100px] bg-white">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="font-heading font-bold text-[#190E4F] text-3xl md:text-4xl lg:text-5xl text-center mb-4">
          Empresas comprometidas com o diálogo
        </h2>

        <p className="font-medium text-lg md:text-xl text-center text-gray-600 max-w-2xl mx-auto">
          Organizações que acreditam no poder da comunicação para transformar
          comunidades
        </p>
      </motion.header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl mx-auto">
        {Array.from({ length: PLACEHOLDER_SLOTS }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/60 transition-all duration-300 hover:border-[#1565C0]/40 hover:bg-blue-50/40"
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
              <Building2 className="h-6 w-6 text-gray-300 transition-colors group-hover:text-[#1565C0]/60" />
              <span className="text-sm font-medium text-gray-500 transition-colors group-hover:text-[#1565C0]/70">
                Sua empresa aqui
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <Link
        href="/onboarding/company/step1"
        className="text-sm font-semibold text-[#1565C0] hover:underline"
      >
        Quero cadastrar minha empresa →
      </Link>
    </section>
  );
}
