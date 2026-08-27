import { expect, type APIRequestContext } from "@playwright/test";

import { tituloDeTeste } from "./db";

/**
 * Criação de relato pela API, para testes que precisam de um relato *existindo*
 * e não do wizard em si — o wizard tem spec própria (`complaint-create.spec.ts`).
 *
 * Todo título passa por `tituloDeTeste`, então a limpeza de `db.ts` recolhe o
 * que estes testes criarem.
 */

/** Cria um relato. O contexto precisa estar logado como pessoa. */
export async function criarRelato(
  request: APIRequestContext,
  opcoes: { empresaId: string; assunto: string; publico?: boolean }
): Promise<{ id: string; titulo: string }> {
  const titulo = tituloDeTeste(opcoes.assunto);
  const resposta = await request.post("/api/complaints", {
    data: {
      company_id: opcoes.empresaId,
      title: titulo,
      description:
        "Relato criado por teste automatizado, com texto suficiente para passar na validação.",
      is_public: opcoes.publico ?? true,
      is_anonymous: false,
    },
  });
  expect(
    resposta.status(),
    `POST /api/complaints devolveu ${resposta.status()}: ${await resposta.text()}`
  ).toBe(201);
  const criado = await resposta.json();
  return { id: criado.id, titulo };
}

/** Id da empresa à qual a conta logada pertence. Exige sessão de empresa. */
export async function empresaDaConta(request: APIRequestContext): Promise<string> {
  const resposta = await request.get("/api/company/profile");
  expect(resposta.ok(), "GET /api/company/profile falhou").toBeTruthy();
  const { company } = await resposta.json();
  return company.id as string;
}

/** Qualquer empresa diferente da informada — usada nos testes de acesso cruzado. */
export async function outraEmpresa(
  request: APIRequestContext,
  empresaId: string
): Promise<string> {
  const resposta = await request.get("/api/companies");
  const empresas = (await resposta.json()) as Array<{ id: string; name: string }>;
  const outra = empresas.find((empresa) => empresa.id !== empresaId);
  if (!outra) {
    throw new Error(
      "O banco só tem uma empresa. O seed precisa de pelo menos duas para o teste de acesso cruzado."
    );
  }
  return outra.id;
}

/** Status visto pela empresa dona do relato. Exige sessão de empresa. */
export async function statusPelaEmpresa(
  request: APIRequestContext,
  id: string
): Promise<string> {
  const resposta = await request.get(`/api/company/complaints/${id}`);
  expect(
    resposta.ok(),
    `GET /api/company/complaints/${id} devolveu ${resposta.status()}`
  ).toBeTruthy();
  const { complaint } = await resposta.json();
  return complaint.status as string;
}

/** Status visto pela autora. Exige sessão da pessoa que criou o relato. */
export async function statusPelaAutora(
  request: APIRequestContext,
  id: string
): Promise<string> {
  const resposta = await request.get("/api/complaints?mine=1");
  expect(resposta.ok(), "GET /api/complaints?mine=1 falhou").toBeTruthy();
  const lista = (await resposta.json()) as Array<{ id: string; status: string }>;
  const relato = lista.find((item) => item.id === id);
  if (!relato) {
    throw new Error(`Relato ${id} não apareceu na lista da autora.`);
  }
  return relato.status;
}
