"use client";

import { useLayoutEffect } from "react";

/**
 * Hook global para prevenir scroll do body quando dropdowns/modais abrem
 * 
 * Com scrollbar-gutter: stable no CSS, não precisamos mais calcular padding
 * O CSS já reserva o espaço da scrollbar automaticamente, evitando layout shift
 * 
 * Este hook apenas bloqueia o scroll quando necessário
 * 
 * @param isOpen - Quando true, bloqueia o scroll do body
 */
export function usePreventScrollShift(isOpen: boolean) {
  useLayoutEffect(() => {
    if (!isOpen) {
      // Restore scroll when closing
      document.body.style.overflow = "";
      document.body.classList.remove("dropdown-open");
      return;
    }

    // Block scroll when opening
    // scrollbar-gutter: stable no CSS já previne o layout shift
    document.body.style.overflow = "hidden";
    document.body.classList.add("dropdown-open");

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("dropdown-open");
    };
  }, [isOpen]);
}

