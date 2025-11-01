"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: 1,
    title: "Crie sua conta",
    description: "Cadastre-se gratuitamente em poucos segundos",
  },
  {
    number: 2,
    title: "Faça uma reclamação",
    description: "Compartilhe sua experiência de forma clara e objetiva",
  },
  {
    number: 3,
    title: "Apoie outras mulheres",
    description: "Comente e dê suporte às reclamações da comunidade",
  },
  {
    number: 4,
    title: "Transforme o mercado",
    description: "Juntas, fazemos as empresas ouvirem e melhorarem",
  },
];

export function Steps() {
  return (
    <section className="px-6 py-16 md:py-24 bg-white text-center">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-bold text-[#190E4F] mb-12"
      >
        Como funciona
      </motion.h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            viewport={{ once: true }}
            className="p-6 bg-[#F5F5F5] rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="block text-[#3BA5FF] text-5xl font-bold mb-4">
              {step.number}
            </span>
            <h4 className="text-[#190E4F] font-semibold text-lg mb-2">
              {step.title}
            </h4>
            <p className="text-[#190E4F]/70 text-sm">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
