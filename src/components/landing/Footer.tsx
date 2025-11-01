"use client";

import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Empresas", href: "/companies" },
  { label: "Fazer Reclamação", href: "/app/complaints/new" },
];

const socialLinks = [
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex flex-col w-full items-start gap-[35px] px-6 md:px-[115px] py-[62px] bg-white">
      <div className="flex flex-wrap w-full items-center gap-4">
        <div className="inline-flex gap-4 items-center">
          <div className="font-bold text-[#190E4F] text-2xl tracking-[-0.29px] leading-[normal]">
            ComunicaMulher
          </div>

          <div className="font-normal text-[#190E4F] text-base tracking-[0] leading-[26px] whitespace-nowrap">
            <span className="font-normal text-[#1e0d62] text-base tracking-[0] leading-[26px]">
              © {currentYear}{" "}
            </span>
            <span className="font-bold">ComunicaMulher</span>
            <span className="font-normal text-[#1e0d62] text-base tracking-[0] leading-[26px]">
              . Todos direitos reservados.
            </span>
          </div>
        </div>

        <nav className="flex items-center justify-center gap-[35px] flex-1">
          {navigationLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="font-normal text-[#190E4F] text-base tracking-[0] leading-[26px] whitespace-nowrap hover:opacity-80 transition-opacity"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <Separator className="w-full h-0.5" />

      <div className="flex flex-col md:flex-row w-full items-start justify-between gap-8">
        <p className="max-w-[917px] font-normal text-base leading-[26px] text-[#190E4F] tracking-[0]">
          <span className="font-bold">ComunicaMulher</span>
          <span className="font-normal">
            {" "}
            é uma plataforma independente que conecta mulheres impactadas por obras
            de infraestrutura com empresas e órgãos responsáveis.
          </span>
        </p>

        <div className="inline-flex items-start gap-[25px]">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.href}
              aria-label={social.label}
              className="text-[#190E4F] hover:opacity-80 transition-opacity"
            >
              <social.icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
