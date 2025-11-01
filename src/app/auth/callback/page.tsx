"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { supabaseClient } from "@/lib/supabase/client";
import { syncProfileFromOAuth } from "./actions";

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Autenticando...");
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setMessage("Processando autenticação...");
        
        // O Supabase automaticamente processa o token do hash fragment
        const { data, error: authError } = await supabaseClient.auth.getSession();

        if (authError) {
          throw authError;
        }

        if (data.session) {
          setMessage("Sincronizando perfil...");
          
          // Sincroniza perfil com dados do OAuth (se aplicável)
          try {
            await syncProfileFromOAuth();
          } catch (profileError) {
            // Log mas não bloqueia - o perfil pode já existir
            console.warn("Profile sync warning:", profileError);
          }

          setStatus("success");
          
          // Verifica se precisa completar onboarding
          // Note: Como é client component, vamos verificar via API ou redirecionar para app que faz a verificação
          router.push("/app");
        } else {
          throw new Error("No session found");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setStatus("error");
        setMessage("Erro ao autenticar. Redirecionando...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {status === "loading" && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#3BA5FF]" />
            <p className="mt-4 text-neutral-600">{message}</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-2xl">×</span>
            </div>
            <p className="mt-4 text-red-600">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}


