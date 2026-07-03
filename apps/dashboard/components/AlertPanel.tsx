import type { Alert } from "../types/index";

const severityStyles = {
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  critical: "bg-rose-100 text-rose-700 border-rose-200",
  info: "bg-sky-100 text-sky-700 border-sky-200",
} as const;

export function AlertPanel({ alerts }: Readonly<{ alerts: Alert[] }>) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        No alerts at this time. Your checkout funnel is stable.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`rounded-[1.75rem] border p-5 shadow-sm ${severityStyles[alert.severity]}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em]">{alert.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{alert.description}</p>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-900 shadow-sm">
              {alert.severity}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
