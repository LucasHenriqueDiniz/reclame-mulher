import "server-only";

const databaseUrl = process.env.DATABASE_URL ?? process.env.DIRECT_URL;

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

if (!databaseUrl) {
  throw new Error("DATABASE_URL or DIRECT_URL must be set");
}

export const env = {
  databaseUrl,
  sessionSecret: process.env.SESSION_SECRET,
};
