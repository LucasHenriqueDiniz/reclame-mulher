# Skill: Adicionar uma nova API route

## Quando usar
Quando precisar criar um novo endpoint REST.

## Passos

### 1. Criar o arquivo

Caminho: `src/app/api/<nome>/route.ts`

Exemplo mínimo:
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Rate limit se sensível
    const rateLimit = await checkRateLimit(req, 5, 15);
    if (!rateLimit.allowed) {
      return NextResponse.json({ error: "Muitas requisições" }, { status: 429 });
    }

    // Lógica aqui
    const data = await algumRepo.findAlgumaCoisa();

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();

    // Validação
    if (!body.campoObrigatorio) {
      return NextResponse.json({ error: "Campo obrigatório" }, { status: 400 });
    }

    // Lógica aqui

    return NextResponse.json({ id: "novo-id" });
  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

### 2. Usar repository

Nunca acesse o DB diretamente do handler:
```ts
import { AlgumRepo } from "@/server/repos/algum";

const result = await AlgumRepo.findById(id);
```

### 3. Serializar datas

```ts
const serialized = {
  ...result,
  createdAt: result.createdAt.toISOString(),
  updatedAt: result.updatedAt?.toISOString() ?? null,
};
```

### 4. Testar

```bash
curl http://localhost:5000/api/sua-nova-rota
```

## Regras
- Sempre retorne `{ error: string }` em caso de erro
- Sempre logue erros no console
- Use `getSession()` para autenticação
- Use `checkRateLimit()` para endpoints sensíveis
- Valide o body antes de processar
