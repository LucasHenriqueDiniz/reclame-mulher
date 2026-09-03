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
wc -l 'src/app/blog/[slug]/edit/page.tsx' && pnpm run build 2>&1 | tail -3 && pnpm test -- --run 2>&1 | tail -3
```

prints a line count below 500 for the page, a build that ends in `Compiled successfully`, and a test
summary with `0 failed`.

## If stuck

If the state refuses to separate — the likely knot is `featuredImage` being written by the upload
component and read by the save handler — do not lift it into a store. Pass a callback down and keep
the state in the page: `zustand` is already a dependency and reaching for it here would add a second
state model to a file being split for having one too many concerns. If the file still will not go
under 500 after the four extractions, stop at three of them and say so in the PR. 520 lines with clean
seams beats 480 with a component nobody can name.
