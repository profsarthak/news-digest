"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  term: string;
  definition: string;
};

// An inline jargon term: underlined with an info marker; tap to reveal a
// plain-English definition in a small popover.
export function GlossaryTerm({ term, definition }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="relative inline">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="cursor-pointer underline decoration-dotted decoration-honey/70 underline-offset-4 font-medium text-honey hover:decoration-honey"
      >
        {term}
        <span className="ml-0.5 align-super text-[0.6em] text-honey">&#9432;</span>
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-1 block w-64 rounded-lg border border-black/10 bg-white p-3 text-sm leading-snug text-neutral-700 shadow-lg dark:border-white/15 dark:bg-neutral-900 dark:text-neutral-200"
        >
          <span className="mb-1 block font-semibold text-foreground">{term}</span>
          {definition}
        </span>
      )}
    </span>
  );
}
