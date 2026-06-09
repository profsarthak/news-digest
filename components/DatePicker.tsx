"use client";

import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";

type Props = {
  current: string;
  dates: string[];
};

// Header date selector for browsing past mornings. Navigates to /[date].
export function DatePicker({ current, dates }: Props) {
  const router = useRouter();
  return (
    <label className="relative inline-flex items-center">
      <select
        aria-label="Select date"
        value={current}
        onChange={(e) => router.push(`/${e.target.value}`)}
        className="cursor-pointer appearance-none rounded-lg border border-black/10 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-foreground shadow-sm dark:border-white/15 dark:bg-neutral-900"
      >
        {dates.map((d) => (
          <option key={d} value={d}>
            {formatDate(d)}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-2.5 text-neutral-400"
      >
        &#9662;
      </span>
    </label>
  );
}
