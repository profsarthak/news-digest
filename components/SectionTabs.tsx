import Link from "next/link";

type Props = {
  date: string;
  active: "news" | "opinion";
};

// Segmented News / Opinion toggle, shared by the Today view and Opinion page.
export function SectionTabs({ date, active }: Props) {
  const pill = "rounded-full px-3.5 py-1 text-sm font-medium transition";
  const on = "bg-white text-foreground shadow-sm dark:bg-neutral-700";
  const off = "text-neutral-500 hover:text-foreground";
  return (
    <nav className="mb-6 inline-flex gap-1 rounded-full bg-black/5 p-0.5 dark:bg-white/10">
      <Link href={`/${date}`} className={`${pill} ${active === "news" ? on : off}`}>
        News
      </Link>
      <Link
        href={`/${date}/opinion`}
        className={`${pill} ${active === "opinion" ? on : off}`}
      >
        Opinion
      </Link>
    </nav>
  );
}
