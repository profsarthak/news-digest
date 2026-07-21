import Link from "next/link";
import type { Digest, Topic } from "@/lib/types";
import { GlossaryText } from "./GlossaryText";
import { formatDate } from "@/lib/format";

type Props = {
  topic: Topic;
  digest: Digest;
};

const EYEBROW =
  "font-mono text-[11px] font-normal uppercase leading-none tracking-[0.14em] text-ink-500";

function WebSearchTag() {
  return (
    <span className="ml-2 inline-flex items-center border-[1.5px] border-muted-fg px-[7px] py-[4px] font-mono text-[10px] uppercase leading-none tracking-[0.06em] text-muted-fg">
      web-searched
    </span>
  );
}

// Full reading view for one topic: display headline, body prose with inline
// glossary popovers, context, implications (sage warm surface), sources.
export function TopicDetail({ topic, digest }: Props) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-20 pt-6 sm:pt-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/${digest.date}`}
          className="font-mono text-[11px] uppercase leading-none tracking-[0.06em] text-orange-600 hover:text-orange-700 hover:underline"
        >
          &larr; Back
        </Link>
        <span className={EYEBROW}>{formatDate(digest.date)}</span>
      </div>

      <article className="font-body text-[17px] leading-[1.7] text-ink-700">
        <h1 className="mb-6 font-display text-4xl font-bold leading-[0.98] tracking-[-0.045em] text-ink-900">
          {topic.title}
        </h1>

        <p className="mb-8">
          <GlossaryText text={topic.explainer} glossary={topic.glossary} />
        </p>

        {topic.context.trim() && (
          <details open className="mb-8 border-t border-hair pt-4">
            <summary className={`cursor-pointer list-none ${EYEBROW}`}>
              Context {topic.researched && <WebSearchTag />}
            </summary>
            <p className="mt-3">
              <GlossaryText text={topic.context} glossary={topic.glossary} />
            </p>
          </details>
        )}

        {topic.implications.trim() && (
          <section className="mb-8 border-[1.5px] border-ink-900 bg-sage p-5 shadow-card">
            <h2 className={`mb-3 ${EYEBROW} text-ink-700`}>
              Implications {topic.researched && <WebSearchTag />}
            </h2>
            <p>
              <GlossaryText text={topic.implications} glossary={topic.glossary} />
            </p>
          </section>
        )}

        <section className="mb-8 border-t border-hair pt-4">
          <h2 className={`mb-3 ${EYEBROW}`}>Sources</h2>
          <ul className="space-y-2">
            {topic.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block text-[15px] leading-snug"
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-900">
                    {s.outlet}
                  </span>
                  <span className="ml-2 text-ink-600 group-hover:text-orange-600 group-hover:underline">
                    {s.headline} &#8599;
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {topic.glossary.length > 0 && (
          <section className="border-t border-hair pt-4">
            <h2 className={`mb-3 ${EYEBROW}`}>Glossary</h2>
            <dl className="space-y-3">
              {topic.glossary.map((g) => (
                <div key={g.term}>
                  <dt className="font-display text-[17px] font-semibold tracking-[-0.02em] text-ink-900">
                    {g.term}
                  </dt>
                  <dd className="text-[15px] leading-relaxed text-ink-600">
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
