import Link from "next/link";

type Props = {
  date: string;
  active: "news" | "opinion";
};

// Square segmented News / Opinion toggle — solid ink marks the active section.
export function SectionTabs({ date, active }: Props) {
  const base =
    "px-4 py-2 font-mono text-[11px] uppercase leading-none tracking-[0.06em] transition";
  const on = "bg-ink-900 text-paper";
  const off = "text-ink-700 hover:bg-bone-dk";

  return (
    <nav className="mb-6 inline-flex border-[1.5px] border-ink-900">
      <Link
        href={`/${date}`}
        className={`${base} ${active === "news" ? on : off} border-r-[1.5px] border-ink-900`}
      >
        News
      </Link>
      <Link
        href={`/${date}/opinion`}
        className={`${base} ${active === "opinion" ? on : off}`}
      >
        Opinion
      </Link>
    </nav>
  );
}
