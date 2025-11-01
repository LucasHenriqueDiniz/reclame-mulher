"use client";

import React from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${Math.floor(latest)}${suffix}`;
      }
    });
  }, [springValue, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export function ImpactStats() {
  const statsData = [
    {
      number: 123,
      suffix: "",
      description: "diálogos iniciados",
    },
    {
      number: 50,
      suffix: "%",
      description: "de resolução",
    },
    {
      number: 123,
      suffix: "",
      description: "comunidades impactadas",
    },
  ];

  return (
    <section className="flex flex-col items-center px-6 md:px-[100px] py-[80px] w-full bg-brand-blue">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="font-heading font-bold text-white text-3xl md:text-4xl lg:text-5xl text-center mb-4">
          Nosso impacto em números
        </h2>
      </motion.header>

      <div className="flex flex-col md:flex-row items-center gap-3 md:gap-6 w-full">
        {statsData.map((stat, index) => (
          <React.Fragment key={index}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="flex-1 flex flex-col items-center justify-center text-center text-white"
            >
              <span className="font-bold text-3xl md:text-4xl lg:text-5xl leading-normal tracking-[0] mb-2">
                <AnimatedNumber value={stat.number} suffix={stat.suffix} />
              </span>
              <span className="font-normal text-lg md:text-xl lg:text-2xl leading-normal tracking-[0]">
                {stat.description}
              </span>
            </motion.div>
            {index < statsData.length - 1 && (
              <div className="hidden md:block w-[2px] h-16 bg-white/30" />
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
