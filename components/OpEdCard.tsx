import type { OpEd } from "@/lib/types";
import { GlossaryText } from "./GlossaryText";

type Props = {
  oped: OpEd;
};

// One op-ed on the Opinion tab: title, byline, a highlighted thesis line, a
// neutral summary with inline glossary popovers, and a read-it link.
export function OpEdCard({ oped }: Props) {
  const byline = oped.author
    ? `by ${oped.author} · ${oped.outlet}`
    : oped.outlet;

  return (
    <article className="rounded-2xl border border-black/10 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900">
      <h2 className="font-mono text-base font-semibold leading-snug tracking-tight text-foreground">
        {oped.title}
      </h2>
      <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{byline}</p>

      {oped.thesis.trim() && (
        <p className="mt-3 border-l-2 border-honey/50 pl-3 font-serif italic text-honey-strong dark:text-amber-300">
          {oped.thesis}
        </p>
      )}

      <p className="mt-3 font-serif text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
        <GlossaryText text={oped.summary} glossary={oped.glossary} />
      </p>

      <a
        href={oped.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-block text-sm font-medium text-honey hover:underline"
      >
        Read the op-ed &#8599;
      </a>
    </article>
  );
}
