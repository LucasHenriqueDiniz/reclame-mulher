import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Snippet templates for the editor, not application code. They are written to
      // be pasted and filled in, so their placeholder parameters are unused by design.
      ".opencodeshare/**",
    ],
  },
  {
    // A leading underscore is how this codebase already says "declared on purpose,
    // not used" — see _includeTags in server/repos/blog.ts and the caught-but-ignored
    // _e in landing/ProcessCarousel. Honouring it turns a convention into a rule.
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
    },
  },
];

export default eslintConfig;
