"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Search, FileText, TrendingUp, Star, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    number: 1,
    label: "etapa 1",
    title: "Identifique o problema",
    description:
      "Selecione a categoria do impacto que afeta você e sua comunidade: deslocamento, segurança, meio ambiente, infraestrutura ou oportunidades econômicas.",
    icon: Search,
  },
  {
    number: 2,
    label: "etapa 2",
    title: "Registre sua experiência",
    description:
      "Compartilhe sua vivência de forma segura e detalhada. Fotos e vídeos podem ser anexados para melhor documentação.",
    icon: FileText,
  },
  {
    number: 3,
    label: "etapa 3",
    title: "Acompanhe a resolução",
    description:
      "Monitore em tempo real o status da sua solicitação, desde o recebimento até a implementação das soluções.",
    icon: TrendingUp,
  },
  {
    number: 4,
    label: "etapa 4",
    title: "Avalie o resultado",
    description:
      "Dê seu feedback sobre as medidas adotadas e ajude a melhorar o processo para toda a comunidade.",
    icon: Star,
  },
];

export function ProcessCarousel() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragThreshold = 50; // pixels mínimos para considerar um drag

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
  };

  const handleMouseMove = (_e: React.MouseEvent) => {
    if (!isDragging) return;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = e.clientX - dragStartX.current;
    if (Math.abs(deltaX) > dragThreshold) {
      if (deltaX > 0) {
        prevStep();
      } else {
        nextStep();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (_e: React.TouchEvent) => {
    if (!isDragging) return;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaX = e.changedTouches[0].clientX - dragStartX.current;
    if (Math.abs(deltaX) > dragThreshold) {
      if (deltaX > 0) {
        prevStep();
      } else {
        nextStep();
      }
    }
  };

  const progressValue = ((currentStep + 1) / steps.length) * 100;
  const CurrentIcon = steps[currentStep].icon;

  // Variantes de animação
  const cardVariants = {
    enter: {
      opacity: 0,
      x: 20,
      scale: 0.95,
    },
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
    },
    exit: {
      opacity: 0,
      x: -20,
      scale: 0.95,
    },
  };

  return (
    <section className="relative w-full bg-white py-20">
      <div className="mx-auto max-w-[1200px] px-4 md:px-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="font-heading font-bold text-[var(--brand-purple-dark)] text-3xl md:text-4xl lg:text-5xl text-center mb-4">
            Como sua voz é ouvida e transformada em ação
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl font-medium">
            Um processo simples e transparente em 4 etapas
          </p>
        </motion.div>

        <div className="relative w-full max-w-[600px]">
          {/* Botão lateral esquerdo */}
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 md:-translate-x-16 z-10 
                     w-10 h-10 md:w-12 md:h-12 rounded-full 
                     bg-white border border-border shadow-lg
                     flex items-center justify-center
                     text-muted-foreground hover:text-[var(--brand-blue-light)]
                     hover:border-[var(--brand-blue-light)]
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200
                     hover:scale-110 active:scale-95"
            aria-label="Etapa anterior"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          {/* Card principal com animação */}
          <Card
            className="overflow-hidden shadow-xl rounded-2xl border-0 relative
                     cursor-grab active:cursor-grabbing select-none
                     min-h-[360px] max-h-[460px] md:min-h-[420px] md:max-h-[520px]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Progress bar */}
            <div className="relative w-full h-2 bg-secondary">
              <Progress value={progressValue} className="h-full [&>div]:bg-[var(--brand-blue-light)]" />
            </div>

              <div className="absolute -right-16 -bottom-16 md:-right-24 md:-bottom-24 opacity-5 pointer-events-none z-0 w-64 h-64 md:w-80 md:h-80">
                <CurrentIcon className="w-full h-full text-[var(--brand-purple-dark)]" />
            </div>
            
            <CardContent className="p-8 md:p-10 relative overflow-hidden h-full flex flex-col min-h-[320px] md:min-h-[380px]">
              {/* Ícone de fundo grande - renderizado uma vez para evitar shift */}

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={currentStep}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="flex-1 flex flex-col relative z-10"
                >
                  <div className="relative flex items-start gap-6 flex-1">
                    {/* Ícone principal */}
                    <div className="flex items-center justify-center flex-shrink-0
                                  w-14 h-14 md:w-16 md:h-16 rounded-xl
                                  bg-[var(--brand-blue-light)]/10
                                  text-[var(--brand-blue-light)]">
                      <CurrentIcon className="w-7 h-7 md:w-8 md:h-8" />
                    </div>

                    <div className="flex flex-col gap-4 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="opacity-70 font-medium text-[var(--brand-blue-light)] text-sm uppercase tracking-wider">
                          {steps[currentStep].label}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-[var(--brand-purple-dark)] text-2xl md:text-3xl lg:text-4xl tracking-tight">
                        {steps[currentStep].title}
                      </h3>

                      <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
                        {steps[currentStep].description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots indicadores */}
              <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-border">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`h-2 rounded-full transition-all duration-200 ${
                      index === currentStep
                        ? "bg-[var(--brand-blue-light)] w-8"
                        : "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Ir para etapa ${index + 1}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botão lateral direito */}
          <button
            onClick={nextStep}
            disabled={currentStep === steps.length - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 md:translate-x-16 z-10
                     w-10 h-10 md:w-12 md:h-12 rounded-full
                     bg-white border border-border shadow-lg
                     flex items-center justify-center
                     text-muted-foreground hover:text-[var(--brand-blue-light)]
                     hover:border-[var(--brand-blue-light)]
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200
                     hover:scale-110 active:scale-95"
            aria-label="Próxima etapa"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-12 text-center flex flex-col items-center gap-2"
        >
          <p className="text-muted-foreground text-lg md:text-xl mb-6 font-medium">
            Quer fazer uma reclamação?
          </p>
          <Link href="/app/complaints/new">
            <Button
              size="lg"
              className="bg-[var(--brand-blue-light)] hover:bg-[var(--brand-blue)] text-white 
                       px-8 py-6 text-base md:text-lg font-semibold rounded-full
                       shadow-lg hover:shadow-xl transition-all duration-200
                       flex items-center gap-2 group"
            >
              <span>Fazer uma reclamação</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}