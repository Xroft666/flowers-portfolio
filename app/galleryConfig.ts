/**
 * Gallery reorder is turned on with the on-page "Reorder" switch (see `Gallery.tsx`).
 *
 * Set `NEXT_PUBLIC_HIDE_GALLERY_REORDER_TOGGLE=true` to hide that switch (e.g. on a public
 * deploy where visitors should not see it).
 */
export const GALLERY_REORDER_TOGGLE_VISIBLE =
  process.env.NEXT_PUBLIC_HIDE_GALLERY_REORDER_TOGGLE !== "true";

const githubRepository = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY ?? "";
const defaultGlobalOrderEditUrl = githubRepository
  ? `https://github.com/${githubRepository}/edit/main/app/globalOrder.ts`
  : "";

/**
 * Optional direct link for "Make Global Default" button.
 * Suggested value: https://github.com/<owner>/<repo>/edit/main/app/globalOrder.ts
 */
export const GLOBAL_ORDER_EDIT_URL =
  process.env.NEXT_PUBLIC_GLOBAL_ORDER_EDIT_URL ?? defaultGlobalOrderEditUrl;
