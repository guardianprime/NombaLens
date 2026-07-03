export function Badge({
  status,
}: Readonly<{
  status: "pending" | "completed" | "recovered";
}>) {
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]";
  const styles = {
    pending: "bg-amber-100 text-amber-700",
    completed: "bg-emerald-100 text-emerald-700",
    recovered: "bg-sky-100 text-sky-700",
  } as const;

  return <span className={`${base} ${styles[status]}`}>{status}</span>;
}
