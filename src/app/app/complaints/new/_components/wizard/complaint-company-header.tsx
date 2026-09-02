"use client";

import Image from "next/image";
import { MapPin, BarChart2, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ComplaintCompanyHeaderProps {
  name: string;
  logoUrl?: string | null;
  verified?: boolean;
  region?: string | null;
  projectsCount: number;
}

/**
 * The company header inside the wizard.
 * Shows the avatar, name, verification badge, location and projects.
 * Follows the Figma design and its visual density.
 */
export function ComplaintCompanyHeader({
  name,
  logoUrl,
  verified,
  region,
  projectsCount,
}: ComplaintCompanyHeaderProps) {
  const initial = name.slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center justify-start gap-4 pt-0 pb-5 px-0 w-full border-b-2 border-gray-100">
      {/* Company avatar */}
      <div className="relative w-[100px] h-[100px] rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={name}
            width={100}
            height={100}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-[#1E88E5] text-3xl font-bold font-['Poppins']">
            {initial}
          </span>
        )}
        {verified && (
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#4299FF] rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <div className="inline-flex flex-col items-start justify-center gap-1.5 flex-1">
        {/* Company name and badge */}
        <div className="gap-2.5 inline-flex items-center flex-wrap">
          <span className="font-['Poppins'] font-semibold text-[#2A3F54] text-xl leading-normal">
            {name}
          </span>
          {verified && (
            <Badge className="bg-gradient-to-r from-[#4299FF] to-[#1E88E5] text-white text-xs font-['Poppins'] font-bold px-2.5 py-1 rounded-md leading-tight hover:from-[#1E88E5] hover:to-[#1976D2] border-0 shadow-sm">
              VERIFICADA
            </Badge>
          )}
        </div>

        {/* Company info row */}
        <div className="flex items-center gap-4 flex-wrap">
          {region && (
            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <MapPin className="w-4 h-4 text-[#1E88E5]" />
              <span className="font-['Poppins'] font-medium text-[#607D8B] text-xs leading-normal">
                {region}
              </span>
            </div>
          )}
          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <BarChart2 className="w-4 h-4 text-[#1E88E5]" />
            <span className="font-['Poppins'] font-medium text-[#607D8B] text-xs leading-normal whitespace-nowrap">
              {projectsCount} {projectsCount === 1 ? "projeto" : "projetos"} em andamento
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
