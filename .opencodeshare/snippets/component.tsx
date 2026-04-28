import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  titulo?: string;
}

export function MeuComponente({ children, titulo }: CardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
      {titulo && (
        <h3 className="font-['Poppins'] font-semibold text-[#2A3F54] mb-3">
          {titulo}
        </h3>
      )}
      {children}
    </div>
  );
}
