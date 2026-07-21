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
        className="cursor-pointer underline decoration-dotted decoration-orange-500/70 underline-offset-4 font-medium text-orange-700 hover:decoration-orange-500"
      >
        {term}
        <span className="ml-0.5 align-super text-[0.6em] text-orange-500">&#9432;</span>
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-0 top-full z-20 mt-1 block w-64 border-[1.5px] border-ink-900 bg-paper p-3 font-body text-sm leading-snug text-ink-700 shadow-card"
        >
          <span className="mb-1 block font-mono text-[11px] uppercase tracking-[0.06em] text-ink-900">
            {term}
          </span>
          {definition}
        </span>
      )}
    </span>
  );
}
