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
      // next/image is off the table here. next.config sets images.unoptimized,
      // which 849d278 added to stop Vercel's image optimizer from billing — it had
      // started answering 402. With that flag on, <Image /> renders a plain <img>
      // and optimizes nothing, so converting the seven call sites would demand
      // explicit width/height at every one and return none of what the rule
      // promises. The rule's own message even warns the change "may incur
      // additional usage or cost from your provider", which is the thing being
      // avoided. Re-enable this rule together with an image loader, not before.
      "@next/next/no-img-element": "off",
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
