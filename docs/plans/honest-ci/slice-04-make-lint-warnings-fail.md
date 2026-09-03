---
status: todo
tags:
  - area/ci
  - area/lint
kanban: c6bf75a8-4c5a-4ffe-9fe7-33aade3f43a4
---

# Slice 04 — Make a lint warning fail the build

## Delivers

`pnpm run lint` becomes `eslint --max-warnings=0`, so the CI `Lint` step turns red on a warning
instead of printing it and passing. A warning that does not break the build is a comment.

It is one flag on `package.json` line 10 and nothing else. It is a separate card because it has its
own proof and its own timing risk, not because it is big.

## Needs

- Nothing from the other slices — it can ship first if convenient.
- **The window.** This is only free while the tree is clean. Measured on `643e3fb`:

  ```
  files linted: 262   errors: 0   warnings: 0
  ```

  and `pnpm exec eslint --max-warnings=0` exits 0 with no output. The nine warnings from `36bd20d`
  are already gone. Every warning added between now and this slice is one this slice has to fix, so
  do it before the src/ refactor epics, not after.

## Tests

- `pnpm run lint` exits 0 on the current tree.
- `pnpm run lint` exits non-zero after introducing one warning — the cheapest is an unused variable
  that does not start with `_`, since `eslint.config.mjs` sets `@typescript-eslint/no-unused-vars` to
  `warn` with `varsIgnorePattern: "^_"`.
- The `no-img-element` rule stays off. `eslint.config.mjs` carries the reason (`next.config` sets
  `images.unoptimized` after the image optimizer started returning 402), and this slice does not
  reopen it.

## Done when

```bash
pnpm run lint; echo "exit=$?"
```

prints `exit=0` with no warning lines. Then add `const unusedOnPurpose = 1;` to any file under `src/`
and the same command prints an ESLint warning and `exit=1`. Remove the line.

## If stuck

If the flag surfaces warnings that this tree does not actually have today — most likely because CI's
Node or ESLint version resolves a rule this machine does not — do not weaken the flag to
`--max-warnings=9`. Turn the specific offending rule off in `eslint.config.mjs` with a comment naming
the reason, the way `no-img-element` already is. A number in the flag decays silently; a disabled rule
with an argument beside it does not.
