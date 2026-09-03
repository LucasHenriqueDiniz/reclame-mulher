---
status: todo
tags:
  - area/clean-code
kanban: b465755d-aaf6-4a7d-a368-a385d669ea2c
---

# Slice 01 — Split the blog edit page

## Delivers

`src/app/blog/[slug]/edit/page.tsx` drops from 664 lines to under 500, and the page keeps behaving
identically for both of the modes it serves.

It is first because it is the largest and because it is the only one of the four that is a `page.tsx`
rather than a `_components/` file — everything in it is inline, with nothing extracted yet.

The seam is visible from the top of the file: **fourteen `useState` calls in one component**
(lines 50–64), covering three separate concerns — the post fields (`title`, `content`, `tags`,
`newTag`, `author`, `featuredImage`), the image upload (`uploading`, `dragActive`) and the request
lifecycle (`loading`, `saving`, `loadError`, `saveError`, `postId`, `activeTab`).

The extraction that follows that seam:

- `_components/featured-image-field.tsx` — the upload and drag-and-drop, owning `uploading` and
  `dragActive`
- `_components/tag-input.tsx` — `tags` and `newTag`
- `_components/post-preview.tsx` — the `activeTab === "preview"` branch
- the two pure helpers at lines 38–45, `getErrorMessage` and `createSlugFromTitle`, to
  `_components/edit-post-helpers.ts` where they can be tested

## Needs

- **Slice 02 of `honest-ci`.** Moving state across a component boundary is exactly the change that
  looks correct and is not. Without a runner there is nothing to catch it.
- `useEffect` at line 68 loads the post. It reads state this slice is moving; check its dependency
  array before and after, because that is where a split silently turns one fetch into a loop.
- The page serves two modes off one `isNew` flag (`const [loading, setLoading] = useState(!isNew)`).
  Both get walked by hand.

## Tests

- `createSlugFromTitle` gets unit tests: an ASCII title, a title with accents, a title with
  punctuation, an empty string. It is pure and currently untested.
- `getErrorMessage` gets tests: an `Error`, a string, `undefined` — it must return the fallback for
  the last one.
- Manual walkthrough, both modes, recorded in the PR: create a post and save it; open an existing post
  and save it; add and remove a tag; upload a featured image by picker and by drag; toggle to preview
  and back.
- Extracted components are named in English. The repo already carries Portuguese component names in
  its sibling files (`ProjetosTab`, `ReclamacoesTab`); do not add more while creating new files.

## Done when

```bash
wc -l 'src/app/blog/[slug]/edit/page.tsx'
if ! grep -q '"test":' package.json; then
  echo "tests: FAILED — no test script; honest-ci slice 02 is not done"
elif pnpm test --run >/dev/null 2>&1; then
  echo "tests: ok"
else
  echo "tests: FAILED"
fi
pnpm run build >/dev/null 2>&1 && echo "build: ok" || echo "build: FAILED"
```

prints a line count below 500 for the page, then `tests: ok`, then `build: ok`. Today it prints `664`,
the `tests: FAILED — no test script; honest-ci slice 02 is not done` line, and `build: ok` — the line
count and the runner are what this slice and its dependency move.

Four things about that block, because the obvious phrasings are all wrong here:

- **The build is checked by its exit code, not by grepping its output.** `next build` prints
  `✓ Compiled successfully` on line 8 of 108 and *then* runs `Linting and checking validity of types`,
  so a type error still leaves `Compiled successfully` in the log. Grepping for it would go green on a
  broken build. `| tail -3` is worse: the last three lines are the
  `○ (Static) prerendered as static content` legend, never the compile line.
- **The runner is checked for existence, and that check gates the run.** With no `test` script in
  `package.json`, `pnpm test --run` exits **0** and prints nothing — a silent pass. So the
  `grep -q '"test":'` result has to decide whether the run happens at all; printing a warning beside a
  run that still reports `tests: ok` is the same false green in a louder shirt. `"test:demo"` does not
  match the grep.
- **No `--` before `--run`.** `pnpm test -- --run` hands `--run` to the `--` bucket, where the runner
  never reads it — so the flag that is supposed to stop watch mode does nothing. Measured on Vitest
  4.1.11, which defaults to `watch: !isCI && process.stdin.isTTY && !isAgent`: on a developer's own
  terminal that form printed `DEV v4.1.11` and then `PASS Waiting for file changes...`, and the gate
  hung without ever reaching `tests: ok` or `tests: FAILED`. `pnpm test --run` exited 0 on the same
  terminal. The `--` form only looks like it works through a pipe or in CI, where the absent TTY
  switches watch off regardless of the flag.
- **No literal from the test summary is asserted**, because the runner is not chosen until honest-ci
  slice 02 and the two candidates disagree: Vitest prints `Tests  5 passed (5)` and emits no `N failed`
  at all when green, while `node --test` prints `# fail 0`. Both exit non-zero on failure, so the exit
  code is the one signal that holds either way. If the runner turns out to be Vitest, note that its
  final block is Test Files / Tests / Start at / Duration plus a blank line, so `tail -3` cuts the
  `Tests` line off — use `tail -5`, as honest-ci slice 02 does.

## If stuck

If the state refuses to separate — the likely knot is `featuredImage` being written by the upload
component and read by the save handler — do not lift it into a store. Pass a callback down and keep
the state in the page: `zustand` is already a dependency and reaching for it here would add a second
state model to a file being split for having one too many concerns. If the file still will not go
under 500 after the four extractions, stop at three of them and say so in the PR. 520 lines with clean
seams beats 480 with a component nobody can name.
