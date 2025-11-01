import Image from "next/image";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-[100dvh]">
      {/* BG image */}
      <Image
        src="/images/bg-people.jpg"
        alt=""
        priority
        fill
        className="object-cover"
      />
      {/* Overlay roxo com vinheta */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3F237E]/80 to-[#280F5E]/80" />
      <div className="absolute inset-0 pointer-events-none ring-1 ring-white/10" />
      {/* Conteúdo */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:py-16">
        {children}
      </div>
    </div>
  );
}


