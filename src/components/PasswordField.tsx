"use client";
import { useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export const PasswordField = forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={show ? "text" : "password"} className={className} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        // O rótulo diz o que a ação faz, não o nome do ícone: quem usa leitor de
        // tela precisa saber o efeito do clique, e ele muda conforme o estado.
        aria-label={show ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={show}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-600"
      >
        {show ? (
          <EyeOff className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Eye className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
});

PasswordField.displayName = "PasswordField";



