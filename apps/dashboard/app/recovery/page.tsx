import { getRecoverySessions } from "../../lib/api";
import { RecoveryTable } from "../../components/RecoveryTable";
import { Badge } from "../../components/ui/Badge";

const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID ?? "";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function RecoveryPage() {
  if (!merchantId) {
    throw new Error("Missing NEXT_PUBLIC_MERCHANT_ID");
  }

  const { sessions } = await getRecoverySessions(merchantId);
  const recoveredRevenue = sessions
    .filter((session) => session.status === "recovered")
    .reduce((sum, session) => sum + session.amount, 0);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">Recovery insights</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Recovered checkouts</h1>
          </div>
          <div className="rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
            {sessions.length} sessions tracked
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Recovered revenue</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">{formatCurrency(recoveredRevenue)}</p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Recovered sessions</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {sessions.filter((session) => session.status === "recovered").length}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm text-slate-500">Pending follow-up</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {sessions.filter((session) => session.status === "pending").length}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">Recovery table</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Abandoned checkout recovery</h2>
          </div>
          <Badge status="recovered" />
        </div>

        <RecoveryTable sessions={sessions} />
      </section>
    </div>
  );
}
