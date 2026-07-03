import type { RecoverySession } from "../types/index";
import { Badge } from "./ui/Badge";

export function RecoveryTable({ sessions }: Readonly<{ sessions: RecoverySession[] }>) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
        No recovered sessions found for this merchant yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.24em] text-slate-500">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Recovered</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-t border-slate-200 last:border-b-0">
                <td className="px-6 py-4 text-sm text-slate-700">{session.customerEmail}</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                    maximumFractionDigits: 0,
                  }).format(session.amount)}
                </td>
                <td className="px-6 py-4">
                  <Badge status={session.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {new Date(session.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {session.recoveredAt
                    ? new Date(session.recoveredAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
