import type { Config } from "drizzle-kit";

// Use DIRECT (non-pooled) connection for drizzle-kit; pooled can cause "Tenant or user not found"
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("DIRECT_URL or DATABASE_URL must be set");

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url,
  },
  verbose: true,
  strict: true,
} satisfies Config;
