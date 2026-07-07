"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function Hero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/companies?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
      <section className="relative w-full min-h-[600px] md:min-h-[700px] overflow-hidden bg-[url('/hero.webp')] bg-cover bg-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/60 to-black/40" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 w-full min-h-[600px] md:min-h-[700px] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="font-heading w-full max-w-5xl font-bold text-white text-center mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight"
        >
          Conectando vozes que transformam comunidades
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="w-full max-w-2xl font-normal text-white/95 text-center mb-10 text-base sm:text-lg md:text-xl leading-relaxed"
        >
          Diálogo direto entre mulheres e responsáveis por obras de infraestrutura
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          onSubmit={handleSearch}
          className="w-full max-w-3xl"
        >
          <fieldset className="flex flex-col sm:flex-row gap-3 bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20">
            <legend className="sr-only">Buscar por empresa ou órgão</legend>
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60 pointer-events-none" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Procure por empresa/órgão..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-12 sm:h-14 bg-transparent border-0 text-white text-base sm:text-lg placeholder:text-white/60 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent pl-10 pr-3"
                aria-label="Buscar por empresa ou órgão público"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-12 sm:h-14 px-6 sm:px-10 bg-[#3BA5FF] hover:bg-[#2d94f5] rounded-full font-semibold text-white text-base sm:text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              aria-label="Pesquisar empresa ou órgão"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
              <span>Pesquisar</span>
            </Button>
          </fieldset>
        </motion.form>
      </div>
    </section>
  );
}