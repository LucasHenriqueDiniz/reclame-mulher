"use client";

/**
 * Página de apoio ao desenvolvimento: links rápidos e quais contas o seed cria.
 *
 * **Nada de credencial aqui.** Até a task `63` este arquivo listava as contas do
 * seed e imprimia a senha padrão com botão de copiar — inclusive a de
 * administrador. Como `/ajuda` é rota pública e não tinha trava de ambiente, a
 * senha do admin ia no HTML servido em produção.
 *
 * Duas coisas mudaram, e as duas precisam continuar valendo:
 *
 * 1. A senha saiu daqui. Quem precisa dela procura no `README.md`, que não é
 *    servido pela aplicação.
 * 2. `page.tsx` derruba a rota fora de desenvolvimento, no servidor.
 *
 * A primeira é a que importa: este é um componente de cliente, então tudo que
 * estiver escrito aqui vai para o pacote do navegador, tenha a rota sido
 * renderizada ou não.
 */

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
  KeyRound,
  MapPin,
  FileText,
  MessageSquare,
} from "lucide-react";

/**
 * Os papéis que o seed cria. **Sem e-mail e sem senha** — quem vai entrar
 * procura no `README.md`, na seção "Contas de teste". Ver task `63`.
 */
const PAPEIS_DO_SEED = [
  {
    papel: "Pessoa",
    descricao: "Duas contas: uma com relatos identificados, outra com relato anônimo.",
    icon: User,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    papel: "Empresa",
    descricao: "Vinculada à Construtora X. Lê e responde relatos.",
    icon: Building2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    papel: "Administração",
    descricao: "Blog, verificação de empresa e consulta de auditoria.",
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

export function AjudaContent() {
  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <MainHeader />

      <div className="mx-auto max-w-5xl px-4 py-28 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-['Poppins'] text-4xl font-bold text-[#2A3F54]">
            Página de Ajuda
          </h1>
          <p className="mt-2 text-lg text-[#546E7A]">
            Links rápidos e o que o seed cria. Apoio ao desenvolvimento — não vai para produção.
          </p>
        </div>

        {/* `min-w-0` nas colunas: sem isso o `min-width: auto` do grid deixa a
            faixa crescer até o min-content do conteúdo mais largo e empurra a
            página inteira — foram 26px em 375px. */}
        <div className="grid min-w-0 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left column — Quick links + info */}
          <div className="min-w-0 space-y-8">
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
                      className="flex items-center gap-3 rounded-lg border border-[#E5E5ED] bg-white p-3 text-sm font-medium text-[#2A3F54] transition hover:border-[#1565C0] hover:shadow-sm"
                    >
                      <link.icon className="h-4 w-4 text-[#1565C0]" />
                      <span className="flex-1">{link.label}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-gray-500" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="font-['Poppins'] text-xl text-[#2A3F54]">
                  Como entrar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[#546E7A]">
                <p>
                  Os e-mails e a senha das contas de teste estão no{" "}
                  <strong className="text-[#2A3F54]">README.md</strong>, na seção
                  &quot;Contas de teste&quot;.
                </p>
                <p>
                  Eles não aparecem nesta página de propósito: ela é servida pela
                  aplicação, e credencial em página servida vaza. Foi o que
                  aconteceu aqui até agosto de 2026.
                </p>
                <p>
                  Com o e-mail em mãos, entre por{" "}
                  <Link href="/login" className="text-[#1565C0] underline">
                    /login
                  </Link>
                  . O seed também cria uma empresa pública:{" "}
                  <Link href="/company/construtora-x" className="text-[#1565C0] underline">
                    /company/construtora-x
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da direita — papéis, não credenciais */}
          <div className="min-w-0">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="font-['Poppins'] text-xl text-[#2A3F54]">
                  O que o seed cria
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {PAPEIS_DO_SEED.map((conta) => (
                  <div
                    key={conta.papel}
                    className="flex items-start gap-3 rounded-lg border border-[#E5E5ED] bg-white p-4 transition hover:shadow-sm"
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${conta.bg}`}
                    >
                      <conta.icon className={`h-5 w-5 ${conta.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                        {conta.papel}
                      </span>
                      <p className="mt-1 text-xs text-[#546E7A]">{conta.descricao}</p>
                    </div>
                  </div>
                ))}

                <div className="rounded-lg bg-[#E3F2FD] p-4 text-sm">
                  <div className="flex items-center gap-2 font-semibold text-[#1565C0]">
                    <KeyRound className="h-4 w-4" />
                    Credenciais
                  </div>
                  <p className="mt-1 text-[#2A3F54]">
                    No <strong>README.md</strong> do repositório. Nunca aqui.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button asChild className="bg-[#1565C0] hover:bg-[#0D47A1]">
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
