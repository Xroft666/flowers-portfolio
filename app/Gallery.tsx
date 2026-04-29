"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GripVertical } from "lucide-react";
import { GALLERY_REORDER_TOGGLE_VISIBLE } from "./galleryConfig";

interface GalleryProps {
  images: string[];
}

const ORDER_STORAGE_KEY = "portfolio-content-image-order";
const REORDER_UI_KEY = "portfolio-gallery-reorder-ui";

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

function mergeSavedOrder(serverImages: string[], saved: string[] | null): string[] {
  if (!saved?.length) return serverImages;
  const valid = new Set(serverImages);
  const ordered: string[] = [];
  for (const src of saved) {
    if (valid.has(src)) ordered.push(src);
  }
  for (const src of serverImages) {
    if (!ordered.includes(src)) ordered.push(src);
  }
  return ordered;
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

  useEffect(() => {
    if (!GALLERY_REORDER_TOGGLE_VISIBLE) return;
    try {
      if (localStorage.getItem(REORDER_UI_KEY) === "1") setReorderEnabled(true);
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

  const persistOrder = useCallback((next: string[]) => {
    if (!reorderEnabled) return;
    try {
      localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(next));
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

  return (
    <>
      {/* MASONRY GRID */}
     <div className="p-24 pt-32">
        {GALLERY_REORDER_TOGGLE_VISIBLE && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4 dark:border-neutral-800">
            <p className="max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
              {reorderEnabled
                ? "Drag a grip onto another image to swap the two. Double-click an image to view fullscreen. Order is saved in this browser."
                : "Turn on Reorder to swap images. Your order is remembered on this device."}
            </p>
            <label className="flex shrink-0 cursor-pointer items-center gap-3 select-none">
              <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
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
          </div>
        )}
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-1">
          {orderedImages.map((src, index) => (
            <motion.div
              key={src}
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
                if (!reorderEnabled) setActiveImage(src);
              }}
              onDoubleClick={() => {
                if (reorderEnabled) setActiveImage(src);
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
              {isVideo(src) ? (
                <video
                  src={src}
                  className="w-full h-auto"
                  muted
                  playsInline
                  loop
                  autoPlay
                />
              ) : (
                <img
                  src={src}
                  alt=""
                  className="w-full h-auto"
                  loading="lazy"
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
              src={activeImage}
              className="max-w-full max-h-full"
              muted
              playsInline
              loop
              autoPlay
              controls
            />
          ) : (
            <img
              src={activeImage}
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
