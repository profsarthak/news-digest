import type { OpEd } from "@/lib/types";
import { GlossaryText } from "./GlossaryText";

type Props = {
  oped: OpEd;
};

// One op-ed: brand Card surface, display headline, mono byline, and the thesis
// carried in orange — the accent is the signal.
export function OpEdCard({ oped }: Props) {
  const byline = oped.author ? `${oped.author} · ${oped.outlet}` : oped.outlet;

  return (
    <article className="border-[1.5px] border-ink-900 bg-paper p-5 shadow-card">
      <h2 className="font-display text-xl font-bold leading-[1.08] tracking-[-0.03em] text-ink-900">
        {oped.title}
      </h2>

      <p className="mt-2 font-mono text-[11px] uppercase leading-none tracking-[0.06em] text-ink-500">
        {byline}
      </p>

      {oped.thesis.trim() && (
        <p className="mt-4 border-l-[3px] border-orange-500 pl-3 font-body text-[15px] italic leading-relaxed text-orange-700">
          {oped.thesis}
        </p>
      )}

      <p className="mt-4 font-body text-[15px] leading-relaxed text-ink-700">
        <GlossaryText text={oped.summary} glossary={oped.glossary} />
      </p>

      <a
        href={oped.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-block font-mono text-[11px] uppercase leading-none tracking-[0.06em] text-orange-600 hover:text-orange-700 hover:underline"
      >
        Read the op-ed &#8599;
      </a>
    </article>
  );
}
