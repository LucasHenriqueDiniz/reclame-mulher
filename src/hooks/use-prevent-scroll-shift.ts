import { useEffect } from "react";

/**
 * Hook that prevents the layout shift a dropdown causes when it opens.
 * Radix UI hides the scrollbar on open, which shifts the page.
 * This hook adds padding to compensate.
 */
export function usePreventScrollShift(isOpen: boolean) {
  useEffect(() => {
    if (typeof CSS !== "undefined" && CSS.supports("scrollbar-gutter: stable")) {
      document.body.style.paddingRight = "";
      return;
    }

    if (isOpen) {
      // Remember the current scrollbar state
      const hasScrollbar = window.innerWidth > document.documentElement.clientWidth;
      
      if (hasScrollbar) {
        // Measure the scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        
        // Pad the body to compensate for the scrollbar Radix is about to hide
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      // Drop the padding on close
      document.body.style.paddingRight = "";
    }

    return () => {
      // Cleanup
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);
}
