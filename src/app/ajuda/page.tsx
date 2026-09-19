import { notFound } from "next/navigation";

import { AjudaContent, type TestUser } from "./_components/ajuda-content";

/**
 * The seeded accounts and the password they share, kept in this server component on
 * purpose.
 *
 * The gate below is not enough by itself. A "use client" module is compiled into the
 * route's JavaScript chunk at build time, so anything declared inside `AjudaContent`
 * ships to the browser whether or not this component ever renders it — a production
 * build with these literals in the client component put all four addresses and
 * `senha123` in `.next/static/chunks/`, reachable through `app-build-manifest.json`,
 * while the page itself correctly answered 404. Holding the values here instead means
 * they only exist in the payload of a render that production never performs.
 *
 * Whatever is added here must stay matched with `scripts/seed.ts`.
 */
const TEST_USERS: TestUser[] = [
  {
    email: "maria@exemplo.com",
    role: "Pessoa",
    description: "Usuária comum com reclamações cadastradas",
  },
  {
    email: "empresa@construtorax.com",
    role: "Empresa",
    description: "Vinculada à Construtora X (pode responder reclamações)",
  },
  {
    email: "ana@exemplo.com",
    role: "Pessoa",
    description: "Usuária anônima com relato público",
  },
  {
    email: "admin@comunicamulher.com.br",
    role: "Admin",
    description: "Acesso total (blog, empresas, auditoria)",
  },
  {
    email: "julia@exemplo.com",
    role: "Pessoa",
    description: "Cadastro parado na etapa 2 do onboarding",
  },
  {
    email: "contato@obrasaurora.com",
    role: "Empresa",
    description: "Cadastro de empresa parado na etapa 2 (Obras Aurora)",
  },
];

const SHARED_PASSWORD = "senha123";

export default function AjudaPage() {
  // A development aid: it lists seeded accounts and their shared password in plain
  // text. Useful locally, a credential dump in production — so the route exists only
  // outside production, where it answers 404 like any unknown path.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <AjudaContent testUsers={TEST_USERS} sharedPassword={SHARED_PASSWORD} />;
}
