import Link from "next/link";
import type { Digest, Topic } from "@/lib/types";
import { GlossaryText } from "./GlossaryText";
import { formatDate } from "@/lib/format";

type Props = {
  topic: Topic;
  digest: Digest;
};

function WebSearchTag() {
  return (
    <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 align-middle text-[11px] font-medium normal-case tracking-normal text-accent dark:bg-white/10 dark:text-neutral-300">
      web-search-backed
    </span>
  );
}

// Full reading view for one topic: explainer with inline glossary popovers,
// context, implications, sources, and a glossary list.
export function TopicDetail({ topic, digest }: Props) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:pt-10">
      <div className="mb-5 flex items-center justify-between text-sm">
        <Link
          href={`/${digest.date}`}
          className="font-medium text-accent hover:text-accent-strong hover:underline"
        >
          &lsaquo; Back
        </Link>
        <span className="text-neutral-500 dark:text-neutral-400">
          {formatDate(digest.date)}
        </span>
      </div>

      <article className="font-serif text-[17px] leading-relaxed text-neutral-800 dark:text-neutral-200">
        <h1 className="mb-5 font-mono text-2xl font-bold leading-tight tracking-tight text-foreground">
          {topic.title}
        </h1>

        <p className="mb-6">
          <GlossaryText text={topic.explainer} glossary={topic.glossary} />
        </p>

        {topic.context.trim() && (
          <details open className="mb-6 border-t border-black/10 pt-4 dark:border-white/10">
            <summary className="cursor-pointer list-none font-sans text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              Context {topic.researched && <WebSearchTag />}
            </summary>
            <p className="mt-3">
              <GlossaryText text={topic.context} glossary={topic.glossary} />
            </p>
          </details>
        )}

        {topic.implications.trim() && (
          <section className="mb-6 rounded-xl border border-honey/25 bg-honey-soft/50 p-4 dark:bg-amber-500/5">
            <h2 className="mb-2 font-sans text-sm font-semibold uppercase tracking-wide text-honey-strong dark:text-amber-300">
              Implications {topic.researched && <WebSearchTag />}
            </h2>
            <p>
              <GlossaryText text={topic.implications} glossary={topic.glossary} />
            </p>
          </section>
        )}

        <section className="mb-6">
          <h2 className="mb-2 font-sans text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            📰 Sources
          </h2>
          <ul className="space-y-1.5">
            {topic.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[15px] text-foreground hover:text-accent-strong hover:underline"
                >
                  <span className="font-medium">{s.outlet}</span>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    {" "}
                    — {s.headline}
                  </span>
                  <span aria-hidden className="ml-1 text-neutral-400">
                    &#8599;
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {topic.glossary.length > 0 && (
          <section className="border-t border-black/10 pt-4 dark:border-white/10">
            <h2 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
              🏷 Glossary
            </h2>
            <dl className="space-y-3">
              {topic.glossary.map((g) => (
                <div key={g.term}>
                  <dt className="font-semibold text-foreground">{g.term}</dt>
                  <dd className="text-[15px] text-neutral-600 dark:text-neutral-300">
                    {g.definition}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </article>
    </main>
  );
}
