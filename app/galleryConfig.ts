/**
 * Gallery reorder is turned on with the on-page "Reorder" switch (see `Gallery.tsx`).
 *
 * Set `NEXT_PUBLIC_HIDE_GALLERY_REORDER_TOGGLE=true` to hide that switch (e.g. on a public
 * deploy where visitors should not see it).
 */
export const GALLERY_REORDER_TOGGLE_VISIBLE =
  process.env.NEXT_PUBLIC_HIDE_GALLERY_REORDER_TOGGLE !== "true";
