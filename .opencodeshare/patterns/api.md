# Padrões de API — Reclame Mulher

## Auth
Todas as rotas de auth têm rate limiting (5 req/15min por IP):
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/register-company`
- `/api/auth/change-password`

Use o rate limiter em novas rotas sensíveis:
```ts
import { checkRateLimit } from "@/lib/rate-limit";

const rateLimit = await checkRateLimit(req, 5, 15);
if (!rateLimit.allowed) {
  return NextResponse.json({ error: "Muitas tentativas. Tente mais tarde." }, { status: 429 });
}
```

## Session
```ts
import { getSession } from "@/lib/auth/session";

const session = await getSession();
if (!session) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
```

## Padrão de API Route
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // ... lógica

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

## UploadThing
Router em `src/app/api/uploadthing/core.ts`:
- `blogImage` — ADMIN only, 4MB
- `complaintAttachment` — logged-in users, image+pdf, 4MB

## Database access
Sempre use repositories, não chame drizzle diretamente do handler:
```ts
import { ComplaintsRepo } from "@/server/repos/complaints";

const complaints = await ComplaintsRepo.findByCompany(companyId);
```

## Serialização de datas
Todas as datas de server -> client devem ser strings ISO:
```ts
const serialized = {
  ...complaint,
  createdAt: complaint.createdAt.toISOString(),
  updatedAt: complaint.updatedAt?.toISOString() ?? null,
};
```

## Regras
- **GET** — pode ser chamado de Server Components
- **POST/PATCH/DELETE** — chamado de Client Components via fetch
- Sempre retorne `{ error: string }` em caso de erro
- Sempre logue erros no console para debugging
