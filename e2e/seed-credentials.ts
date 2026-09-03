import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The seed password is not duplicated here, and it must never be.
 *
 * `scripts/seed.ts` owns it: it hashes that one string into every seeded user.
 * A copy in the test tree would be a second source of truth that goes stale
 * silently — the tests would keep passing against a hash the seed no longer
 * produces, or start failing for a reason nobody can find.
 *
 * Importing the seed module is not an option either: `scripts/seed.ts` calls
 * `main()` at the top level, so importing it wipes the database. So the
 * constant is read out of the file's text instead, and a change to the seed's
 * shape fails loudly here rather than turning into a bad login.
 */
const SEED_SCRIPT = join(__dirname, "..", "scripts", "seed.ts");
const DEFAULT_PASSWORD_PATTERN = /const\s+defaultPassword\s*=\s*["'`]([^"'`]+)["'`]/;

export function readSeedPassword(): string {
  const source = readFileSync(SEED_SCRIPT, "utf8");
  const match = source.match(DEFAULT_PASSWORD_PATTERN);

  if (!match?.[1]) {
    throw new Error(
      `Could not read defaultPassword out of ${SEED_SCRIPT}. ` +
        "The seed script is the only place that password may live — if it was " +
        "renamed or moved, update DEFAULT_PASSWORD_PATTERN, do not paste the " +
        "password into the test tree."
    );
  }

  return match[1];
}

/**
 * The seeded accounts the suite signs in as, one per role the manual describes.
 * Emails are seed data, not credentials, so they are named here directly.
 */
export const SEED_ACCOUNTS = {
  person: { email: "maria@exemplo.com", name: "Maria Silva" },
  company: { email: "empresa@construtorax.com", name: "João Costa" },
  admin: { email: "admin@comunicamulher.com.br", name: "Admin" },
} as const;

export type SeedRole = keyof typeof SEED_ACCOUNTS;

export const STORAGE_STATE = {
  person: join(__dirname, ".auth", "person.json"),
  company: join(__dirname, ".auth", "company.json"),
  admin: join(__dirname, ".auth", "admin.json"),
} as const satisfies Record<SeedRole, string>;
