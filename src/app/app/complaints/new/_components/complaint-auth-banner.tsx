"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ComplaintAuthBanner() {
  return (
    <div className="w-full rounded-xl px-6 py-6 shadow-[0px_4px_4px_#00000040] bg-[linear-gradient(90deg,rgba(30,136,229,1)_0%,rgba(7,85,153,1)_100%)]">
      <div className="flex flex-col gap-3 items-end">
        <h3 className="self-stretch font-bold text-white text-2xl tracking-[-0.40px] leading-normal">
          Você precisa estar em uma conta para criar um relato
        </h3>
        <Link href="/login">
          <Button className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white rounded-xl hover:bg-gray-100">
            <span className="font-bold text-[#1E88E5] text-sm">
              Faça login ou cadastre-se
            </span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
