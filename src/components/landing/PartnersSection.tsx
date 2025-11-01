"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const companyLogos = [
  {
    name: "Starbucks",
    src: "/startbucks.webp",
  },
  {
    name: "Pepsi",
    src: "/pepsi.webp",
  },
  {
    name: "Walmart",
    src: "/walmart.webp",
  },
  {
    name: "Azendoo",
    src: "/azendo.webp",
  },
];

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
        {companyLogos.map((company, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative aspect-[4/3] bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="relative w-full h-full grayscale group-hover:grayscale-0 transition-all duration-300">
                <Image
                  src={company.src}
                  alt={company.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-contain"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
