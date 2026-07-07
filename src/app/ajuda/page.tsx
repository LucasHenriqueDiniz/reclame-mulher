"use client";

import Link from "next/link";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Building2,
  Shield,
  ExternalLink,
  Copy,
  KeyRound,
  MapPin,
  FileText,
  MessageSquare,
} from "lucide-react";

const TEST_USERS = [
  {
    email: "maria@exemplo.com",
    role: "Pessoa",
    description: "Usuária comum com reclamações cadastradas",
    icon: User,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    email: "empresa@construtorax.com",
    role: "Empresa",
    description: "Vinculada à Construtora X (pode responder reclamações)",
    icon: Building2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    email: "ana@exemplo.com",
    role: "Pessoa",
    description: "Usuária anônima com relato público",
    icon: User,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    email: "admin@comunicamulher.com.br",
    role: "Admin",
    description: "Acesso total (blog, empresas, auditoria)",
    icon: Shield,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

const QUICK_LINKS = [
  { href: "/", label: "Home / Landing", icon: MapPin },
  { href: "/search", label: "Pesquisa de Empresas", icon: Building2 },
  { href: "/company/construtora-x", label: "Perfil Público Empresa", icon: Building2 },
  { href: "/blog", label: "Blog / Recursos", icon: FileText },
  { href: "/blog/all", label: "Todos os Posts", icon: FileText },
  { href: "/app/complaints/new", label: "Nova Reclamação", icon: MessageSquare },
  { href: "/app", label: "Área Logada", icon: User },
  { href: "/app/admin/blog", label: "Admin Blog", icon: Shield },
  { href: "/login", label: "Login", icon: KeyRound },
  { href: "/onboarding/role", label: "Cadastro", icon: User },
];

function CopyButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text)}
      className="ml-2 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#1E88E5] transition-colors"
      title="Copiar"
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  );
}

export default function AjudaPage() {
  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <MainHeader />

      <div className="mx-auto max-w-5xl px-4 py-28 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-['Poppins'] text-4xl font-bold text-[#2A3F54]">
            Página de Ajuda
          </h1>
          <p className="mt-2 text-lg text-[#607D8B]">
            Logins de teste, links rápidos e informações úteis para desenvolvimento.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left column — Quick links + info */}
          <div className="space-y-8">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="font-['Poppins'] text-xl text-[#2A3F54]">
                  Links Rápidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  {QUICK_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-3 rounded-lg border border-[#E5E5ED] bg-white p-3 text-sm font-medium text-[#2A3F54] transition hover:border-[#1E88E5] hover:shadow-sm"
                    >
                      <link.icon className="h-4 w-4 text-[#1E88E5]" />
                      <span className="flex-1">{link.label}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="font-['Poppins'] text-xl text-[#2A3F54]">
                  Como usar os logins de teste
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[#607D8B]">
                <p>
                  Todos os usuários de teste usam a mesma senha: <strong className="text-[#2A3F54]">senha123</strong>
                </p>
                <p>
                  Acesse <Link href="/login" className="text-[#1E88E5] hover:underline">/login</Link> e entre com qualquer email da lista ao lado.
                </p>
                <p>
                  O seed também cria uma empresa pública:{" "}
                  <Link href="/company/construtora-x" className="text-[#1E88E5] hover:underline">
                    /company/construtora-x
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right column — Test users */}
          <div>
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="font-['Poppins'] text-xl text-[#2A3F54]">
                  Logins de Teste
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {TEST_USERS.map((user) => (
                  <div
                    key={user.email}
                    className="flex items-start gap-3 rounded-lg border border-[#E5E5ED] bg-white p-4 transition hover:shadow-sm"
                  >
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${user.bg}`}>
                      <user.icon className={`h-5 w-5 ${user.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold text-[#2A3F54]">
                          {user.email}
                        </span>
                        <CopyButton text={user.email} />
                      </div>
                      <span className="inline-block mt-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                        {user.role}
                      </span>
                      <p className="mt-1 text-xs text-[#607D8B]">{user.description}</p>
                    </div>
                  </div>
                ))}

                <div className="rounded-lg bg-[#E3F2FD] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1E88E5]">
                    <KeyRound className="h-4 w-4" />
                    Senha padrão
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[#2A3F54]">
                    <code className="rounded bg-white px-2 py-1 text-sm font-mono">senha123</code>
                    <CopyButton text="senha123" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button asChild className="bg-[#1E88E5] hover:bg-[#1976D2]">
                <Link href="/login">Ir para o Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
