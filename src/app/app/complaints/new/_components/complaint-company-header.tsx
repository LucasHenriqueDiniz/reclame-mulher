"use client";

import Image from "next/image";
import { MapPin, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type ComplaintCompanyHeaderProps = {
  name: string;
  logoUrl?: string | null;
  verified?: boolean;
  region?: string | null;
  projectsCount: number;
};

export function ComplaintCompanyHeader({
  name,
  logoUrl,
  verified,
  region,
  projectsCount,
}: ComplaintCompanyHeaderProps) {
  return (
    <div className="flex items-center justify-start gap-2.5 pt-0 pb-2 px-0 w-full border-b border-gray-200">
      {/* Company avatar */}
      <div className="w-[100px] h-[100px] rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={name}
            width={100}
            height={100}
            className="object-cover"
          />
        ) : (
          <span className="text-gray-400 text-2xl font-bold">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>

      <div className="inline-flex flex-col items-start justify-center">
        {/* Company name and badge */}
        <div className="gap-2 inline-flex items-center">
          <span className="font-semibold text-[#1E88E5] text-xl text-center">
            {name}
          </span>
          {verified && (
            <Badge className="bg-[#4299ff] text-white text-[13px] font-bold px-1 py-1.5 rounded-[3px] leading-[10px] hover:bg-[#4299ff]">
              VERIFICADA
            </Badge>
          )}
        </div>

        {/* Company info row */}
        <div className="flex h-8 items-center gap-2 w-full">
          {region && (
            <div className="inline-flex items-center gap-1.5">
              <MapPin className="w-[18px] h-[18px] text-gray-500" />
              <span className="font-normal text-gray-500 text-[13px]">
                {region}
              </span>
            </div>
          )}
          <div className="inline-flex items-center gap-1.5">
            <BarChart3 className="w-[18px] h-[18px] text-gray-500" />
            <span className="font-normal text-gray-500 text-[13px] whitespace-nowrap">
              {projectsCount} {projectsCount === 1 ? "projeto" : "projetos"} em andamento
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
