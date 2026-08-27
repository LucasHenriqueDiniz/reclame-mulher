import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env.server";

import * as schema from "./schema";

// A URL vem de `env.server`, que valida na subida. Antes disto o arquivo lia
// `process.env` direto e, se não achasse nada, caía numa string falsa — a
// aplicação subia e só falhava a cada requisição. Ver `src/lib/env.server.ts`.
const sql = neon(env.databaseUrl);
export const db = drizzle(sql, { schema });
