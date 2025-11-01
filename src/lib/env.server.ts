import "server-only";
import { z } from "zod";

// Schema completo com variáveis do servidor
const serverEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  DATABASE_URL: z.string().url(),
});

type ServerEnvSchema = z.infer<typeof serverEnvSchema>;

function getServerEnv(): ServerEnvSchema & { databaseUrl: string } {
  const parsed = serverEnvSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
  });

  return {
    ...parsed,
    databaseUrl: parsed.DATABASE_URL,
  };
}

export const env = getServerEnv();
