import { useEffect } from "react";

/**
 * Hook para prevenir layout shift quando dropdowns abrem
 * O Radix UI esconde a scrollbar ao abrir dropdowns, causando shift
 * Este hook adiciona padding para compensar
 */
export function usePreventScrollShift(isOpen: boolean) {
  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports("scrollbar-gutter: stable")) {
      document.body.style.paddingRight = "";
      return;
    }

    if (isOpen) {
      // Salva o estado atual da scrollbar
      const hasScrollbar = window.innerWidth > document.documentElement.clientWidth;
      
      if (hasScrollbar) {
        // Calcula a largura da scrollbar
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        // Adiciona padding ao body para compensar quando o Radix esconder a scrollbar
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      // Remove o padding quando fecha
      document.body.style.paddingRight = "";
    }

    return () => {
      // Cleanup
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);
}
