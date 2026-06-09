// Format an ISO date ("2026-06-09") as "Mon 9 Jun 2026" without timezone drift
// (parse the parts directly rather than via Date(string) which assumes UTC).
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
