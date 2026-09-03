export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

/**
 * The slug a new post is filed under. `\p{L}\p{N}` rather than `\w` so an accented
 * title keeps its letters instead of losing them to hyphens — "Educação" has to
 * survive as `educação`, not `educa-o`.
 */
export function createSlugFromTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}
