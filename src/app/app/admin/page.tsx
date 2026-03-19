import Link from "next/link";
import { Building2, FileText, ShieldCheck, Wrench } from "lucide-react";

const adminCards = [
  {
    href: "/app/admin/blog",
    title: "Blog",
    description: "Criar, editar e publicar posts.",
    icon: FileText,
  },
  {
    href: "/app/admin/companies",
    title: "Empresas",
    description: "Revisar verificacoes e cadastros.",
    icon: Building2,
  },
  {
    href: "/app/admin/audit",
    title: "Auditoria",
    description: "Consultar acoes e eventos do sistema.",
    icon: Wrench,
  },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-slate-900 p-3 text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Painel admin</h1>
            <p className="mt-2 text-slate-600">
              Acesse rapidamente as ferramentas administrativas da plataforma.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {adminCards.map(({ href, title, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-3 text-slate-700">
              <Icon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
