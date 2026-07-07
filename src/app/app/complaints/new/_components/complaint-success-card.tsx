"use client";

import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { protocolId } from "@/components/company/utils";

export type ComplaintSuccessCardProps = {
  title: string;
  complaintId: string;
  companyName: string;
  verified?: boolean;
  estimatedResponseText?: string;
};

export function ComplaintSuccessCard({
  title,
  complaintId,
  companyName,
  verified,
  estimatedResponseText = "Demora normalmente 73 horas para responder, iremos notificar quando seu relato receber uma resposta!",
}: ComplaintSuccessCardProps) {
  return (
    <div className="w-full rounded-2xl px-8 py-12 text-white shadow-2xl bg-gradient-to-br from-[#1E88E5] via-[#1976D2] to-[#075599] relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />
      <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
      <div className="absolute top-1/3 right-1/3 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse delay-75" />
      
      <div className="flex flex-col items-center text-center relative z-10">
        {/* Success icon */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white mb-6 shadow-xl animate-in zoom-in duration-700 delay-100 relative">
          <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
          <Check className="h-14 w-14 text-[#1E88E5] relative z-10" strokeWidth={3} />
        </div>

        {/* Success message */}
        <h2 className="text-3xl font-['Poppins'] font-bold mb-3 animate-in slide-in-from-bottom-4 duration-500 delay-200">
          Seu relato foi criado com sucesso!
        </h2>

        {/* Title */}
        <p className="text-lg font-['Poppins'] font-semibold mb-3 opacity-95 animate-in slide-in-from-bottom-4 duration-500 delay-300">
          {title}
        </p>

        {/* Protocol ID */}
        <div className="mb-8 px-6 py-3 bg-white/15 backdrop-blur-sm rounded-xl border border-white/20 animate-in slide-in-from-bottom-4 duration-500 delay-400">
          <p className="text-sm opacity-90 mb-1 font-['Poppins']">
            Identificador do relato
          </p>
          <p className="text-2xl font-['Poppins'] font-bold tracking-wider">
            {protocolId(complaintId)}
          </p>
        </div>

        {/* Company info */}
        <div className="flex items-center justify-center gap-3 mb-8 bg-white/15 backdrop-blur-sm rounded-2xl px-8 py-4 border border-white/20 animate-in slide-in-from-bottom-4 duration-500 delay-500">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-['Poppins'] font-bold">
              {companyName.slice(0, 1).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="font-['Poppins'] font-semibold text-lg">{companyName}</span>
              {verified && (
                <Badge className="bg-white/25 text-white text-xs font-['Poppins'] font-bold px-2.5 py-1 rounded-md border-0 hover:bg-white/25 shadow-sm">
                  VERIFICADA
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Response time */}
        <div className="mb-8 max-w-md animate-in slide-in-from-bottom-4 duration-500 delay-600">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4" />
            <p className="text-sm font-['Poppins'] font-semibold">O que acontece agora?</p>
          </div>
          <p className="text-sm font-['Poppins'] opacity-95 leading-relaxed">
            {estimatedResponseText}
          </p>
        </div>

        {/* Action button */}
        <Link href={`/app/complaints/${complaintId}`} className="animate-in slide-in-from-bottom-4 duration-500 delay-700">
          <Button className="bg-white text-[#1E88E5] hover:bg-gray-50 hover:scale-105 font-['Poppins'] font-bold px-10 py-4 h-auto rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200">
            Ver meu relato
          </Button>
        </Link>
      </div>
    </div>
  );
}
