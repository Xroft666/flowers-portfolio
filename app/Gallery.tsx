"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import { GALLERY_REORDER_TOGGLE_VISIBLE, GLOBAL_ORDER_EDIT_URL } from "./galleryConfig";
import mipLevelsJson from "../config/mip-levels.json";

interface GalleryProps {
  images: { src: string; width?: number; height?: number }[];
}

const ORDER_STORAGE_KEY = "portfolio-content-image-order";
const REORDER_UI_KEY = "portfolio-gallery-reorder-ui";
const MIPMAPS_UI_KEY = "portfolio-gallery-mipmaps-ui";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const MIP_LEVELS = [...mipLevelsJson.levels].sort((a, b) => a - b);

function filenameFromSrc(src: string): string {
  const path = src.split("?")[0].split("#")[0];
  const segments = path.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (!last) return src;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

function mergeSavedOrder(
  serverImages: { src: string; width?: number; height?: number }[],
  saved: string[] | null,
): { src: string; width?: number; height?: number }[] {
  if (!saved?.length) return serverImages;
  const bySrc = new Map(serverImages.map((item) => [item.src, item]));
  const ordered: { src: string; width?: number; height?: number }[] = [];
  for (const src of saved) {
    const item = bySrc.get(src);
    if (item) ordered.push(item);
  }
  for (const item of serverImages) {
    if (!ordered.some((existing) => existing.src === item.src)) ordered.push(item);
  }
  return ordered;
}

function withBasePath(src: string): string {
  if (!BASE_PATH) return src;
  if (!src.startsWith("/")) return src;
  if (src.startsWith(`${BASE_PATH}/`) || src === BASE_PATH) return src;
  return `${BASE_PATH}${src}`;
}

function toPreviewSrc(src: string, width: number): string {
  return src.replace("/content/", `/content-mips/${width}/`);
}

function pickMipLevel(rectWidth: number): number | null {
  const safeWidth = Number.isFinite(rectWidth) ? rectWidth : 0;
  const dpr = typeof window !== "undefined" ? Math.max(window.devicePixelRatio || 1, 1) : 1;
  const requiredWidth = safeWidth * dpr;
  for (const level of MIP_LEVELS) {
    if (requiredWidth <= level) return level;
  }
  return null;
}

function LazyMedia({
  src,
  video,
  width,
  height,
  useMipmaps,
}: {
  src: string;
  video: boolean;
  width?: number;
  height?: number;
  useMipmaps: boolean;
}) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [sourceOverride, setSourceOverride] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px 0px", threshold: 0.01 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    setContainerWidth(element.clientWidth);
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setContainerWidth(entry.contentRect.width);
    });
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  const mipLevel = pickMipLevel(containerWidth);
  const previewSrc =
    !useMipmaps || mipLevel === null ? src : withBasePath(toPreviewSrc(src, mipLevel));
  const finalSrc = sourceOverride ?? previewSrc;

  useEffect(() => {
    setSourceOverride(null);
  }, [previewSrc]);

  const aspectRatio = width && height ? `${width} / ${height}` : "3 / 4";

  return (
    <div ref={wrapperRef} className="bg-neutral-100 dark:bg-neutral-900">
      {shouldLoad ? (
        video ? (
          <video
            src={src}
            className="block h-auto w-full"
            muted
            playsInline
            loop
            autoPlay
            preload="metadata"
          />
        ) : (
          <img
            src={finalSrc}
            alt=""
            className="block h-auto w-full"
            loading="lazy"
            decoding="async"
            width={width}
            height={height}
            onError={() => {
              if (sourceOverride !== src) {
                setSourceOverride(src);
              }
            }}
          />
        )
      ) : (
        <div className="w-full" style={{ aspectRatio }} />
      )}
    </div>
  );
}

function swapAt<T>(items: T[], i: number, j: number): T[] {
  if (i === j || i < 0 || j < 0 || i >= items.length || j >= items.length) {
    return items;
  }
  const next = [...items];
  const tmp = next[i];
  next[i] = next[j];
  next[j] = tmp;
  return next;
}

export default function Gallery({ images }: GalleryProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [orderedImages, setOrderedImages] = useState(images);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [reorderEnabled, setReorderEnabled] = useState(false);
  const [mipmapsEnabled, setMipmapsEnabled] = useState(true);
  const [globalSyncNote, setGlobalSyncNote] = useState("");

  useEffect(() => {
    if (!GALLERY_REORDER_TOGGLE_VISIBLE) return;
    try {
      if (localStorage.getItem(REORDER_UI_KEY) === "1") setReorderEnabled(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(MIPMAPS_UI_KEY);
      if (raw === "0") setMipmapsEnabled(false);
      if (raw === "1") setMipmapsEnabled(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!reorderEnabled) {
      setDragIndex(null);
      setDragOverIndex(null);
    }
  }, [reorderEnabled]);

  useEffect(() => {
    let saved: string[] | null = null;
    try {
      const raw = localStorage.getItem(ORDER_STORAGE_KEY);
      if (raw) saved = JSON.parse(raw) as string[];
    } catch {
      saved = null;
    }
    setOrderedImages(mergeSavedOrder(images, saved));
  }, [images]);

  const persistOrder = useCallback((next: { src: string }[]) => {
    if (!reorderEnabled) return;
    try {
      localStorage.setItem(
        ORDER_STORAGE_KEY,
        JSON.stringify(next.map((item) => item.src)),
      );
    } catch {
      /* ignore quota / private mode */
    }
  }, [reorderEnabled]);

  const isVideo = (src: string) => {
    const lower = src.toLowerCase();
    return (
      lower.endsWith(".mov") ||
      lower.endsWith(".mp4") ||
      lower.endsWith(".webm")
    );
  };

  const exportGlobalOrder = useCallback(async () => {
    const payload = {
      updatedAt: new Date().toISOString(),
      order: orderedImages.map((item) => item.src),
    };
    const fileText =
      "/**\n" +
      " * Global image order used for all visitors as the default gallery order.\n" +
      " * Updated from the gallery UI.\n" +
      " */\n" +
      `export const GLOBAL_IMAGE_ORDER: string[] = ${JSON.stringify(payload.order, null, 2)};\n`;

    try {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(payload.order));
    } catch {
      /* ignore */
    }

    try {
      await navigator.clipboard.writeText(fileText);
    } catch {
      /* clipboard may be blocked */
    }

    try {
      const blob = new Blob([fileText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "globalOrder.ts";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      /* ignore */
    }

    if (GLOBAL_ORDER_EDIT_URL) {
      window.open(GLOBAL_ORDER_EDIT_URL, "_blank", "noopener,noreferrer");
      setGlobalSyncNote("Copied + downloaded. Update app/globalOrder.ts in GitHub and commit.");
    } else {
      setGlobalSyncNote(
        "Copied + downloaded. Paste into app/globalOrder.ts, commit, and redeploy.",
      );
    }
  }, [orderedImages]);

  return (
    <>
      {/* MASONRY GRID */}
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-6 sm:px-8 sm:pb-32 sm:pt-10 lg:px-12 lg:pb-36 lg:pt-16">
        {GALLERY_REORDER_TOGGLE_VISIBLE && (
          <div className="fixed inset-x-2 bottom-2 z-50 sm:inset-x-4 lg:left-1/2 lg:w-[min(1440px,calc(100vw-3rem))] lg:-translate-x-1/2">
            <div className="flex flex-wrap items-center justify-center gap-2 rounded border border-neutral-200 bg-white/95 px-2 py-2 shadow-lg backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90 sm:justify-between sm:px-3">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <label className="flex cursor-pointer items-center gap-3 select-none">
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 sm:text-sm">
                    Reorder
                  </span>
                  <input
                    type="checkbox"
                    checked={reorderEnabled}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setReorderEnabled(on);
                      try {
                        localStorage.setItem(REORDER_UI_KEY, on ? "1" : "0");
                      } catch {
                        /* ignore */
                      }
                    }}
                    className="h-5 w-9 cursor-pointer rounded-full accent-neutral-900 dark:accent-neutral-100"
                  />
                </label>
                <label className="flex cursor-pointer items-center gap-3 select-none">
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 sm:text-sm">
                    Mipmaps
                  </span>
                  <input
                    type="checkbox"
                    checked={mipmapsEnabled}
                    onChange={(e) => {
                      const on = e.target.checked;
                      setMipmapsEnabled(on);
                      try {
                        localStorage.setItem(MIPMAPS_UI_KEY, on ? "1" : "0");
                      } catch {
                        /* ignore */
                      }
                    }}
                    className="h-5 w-9 cursor-pointer rounded-full accent-neutral-900 dark:accent-neutral-100"
                  />
                </label>
              </div>
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={exportGlobalOrder}
                  className="rounded border border-neutral-300 px-2.5 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800 sm:px-3"
                  title="Export current local order as the new global default"
                >
                  Global Default
                </button>
              </div>
            </div>
          </div>
        )}
        {globalSyncNote && (
          <p className="mb-4 text-xs text-neutral-500 dark:text-neutral-400">{globalSyncNote}</p>
        )}
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-1">
          {orderedImages.map((item, index) => (
            <motion.div
              key={item.src}
              className={`group relative mb-1 break-inside-avoid ${
                reorderEnabled ? "cursor-default" : "cursor-pointer"
              } ${
                reorderEnabled && dragOverIndex === index && dragIndex !== index
                  ? "ring-2 ring-white/40 ring-inset"
                  : ""
              } ${reorderEnabled && dragIndex === index ? "opacity-60" : ""}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              onClick={() => {
                if (!reorderEnabled) setActiveImage(item.src);
              }}
              onDoubleClick={() => {
                if (reorderEnabled) setActiveImage(item.src);
              }}
              onDragOver={
                reorderEnabled
                  ? (e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      if (dragIndex !== null) setDragOverIndex(index);
                    }
                  : undefined
              }
              onDragLeave={
                reorderEnabled
                  ? () => {
                      setDragOverIndex((prev) => (prev === index ? null : prev));
                    }
                  : undefined
              }
              onDrop={
                reorderEnabled
                  ? (e) => {
                      e.preventDefault();
                      if (dragIndex === null) return;
                      const next = swapAt(orderedImages, dragIndex, index);
                      setOrderedImages(next);
                      persistOrder(next);
                      setDragIndex(null);
                      setDragOverIndex(null);
                    }
                  : undefined
              }
            >
              {reorderEnabled && (
                <div
                  className="absolute left-1 top-1 z-10 flex cursor-grab items-center rounded bg-black/60 px-1 py-0.5 text-white shadow-sm ring-1 ring-white/20 active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDragIndex(index);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(index));
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  title="Drag onto another image to swap"
                  aria-label="Drag onto another image to swap"
                >
                  <GripVertical className="size-4" strokeWidth={2} />
                </div>
              )}
              {isVideo(item.src) ? (
                <LazyMedia
                  src={withBasePath(item.src)}
                  video
                  width={item.width}
                  height={item.height}
                  useMipmaps={mipmapsEnabled}
                />
              ) : (
                <LazyMedia
                  src={withBasePath(item.src)}
                  video={false}
                  width={item.width}
                  height={item.height}
                  useMipmaps={mipmapsEnabled}
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* FULLSCREEN */}
      {activeImage && (
        <div
          className="
            fixed inset-0 z-50
            bg-black/90
            flex items-center justify-center
            cursor-pointer
          "
          onClick={() => setActiveImage(null)}
        >
          {isVideo(activeImage) ? (
            <video
              src={withBasePath(activeImage)}
              className="max-w-full max-h-full"
              muted
              playsInline
              loop
              autoPlay
              controls
            />
          ) : (
            <img
              src={withBasePath(activeImage)}
              alt=""
              className="max-w-full max-h-full"
            />
          )}
          <div
            className="pointer-events-none absolute bottom-4 left-4 max-w-[min(90vw,28rem)] truncate font-mono text-[11px] text-white/30 select-text"
            aria-hidden
          >
            {filenameFromSrc(activeImage)}
          </div>
        </div>
      )}
    </>
  );
}
