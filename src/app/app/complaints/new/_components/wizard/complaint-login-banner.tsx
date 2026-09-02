"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

/**
 * The sign-in/sign-up banner, shown while the visitor is not authenticated.
 * Follows the Figma design: blue gradient with a white CTA.
 */
export function ComplaintLoginBanner() {
  return (
    <div className="w-full rounded-2xl px-6 py-7 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-[#1E88E5] via-[#1976D2] to-[#075599] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
      
      <div className="flex flex-col gap-4 items-end relative z-10">
        <h3 className="self-stretch font-['Poppins'] font-bold text-white text-2xl tracking-[-0.40px] leading-normal drop-shadow-sm">
          Você precisa estar em uma conta para criar um relato
        </h3>
        <Link href="/login">
          <Button 
            className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white rounded-xl hover:bg-gray-50 hover:scale-105 transition-all duration-200 h-auto shadow-md hover:shadow-lg"
          >
            <LogIn className="w-4 h-4 text-[#1E88E5]" />
            <span className="font-['Poppins'] font-bold text-[#1E88E5] text-sm">
              Faça login ou cadastre-se
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
