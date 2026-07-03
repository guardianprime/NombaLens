import type { ConversionStats, TimeseriesData } from "../../types/index";
import { ConversionChart } from "../../components/charts/ConversionChart";
import { MethodBreakdown } from "../../components/charts/MethodBreakdown";
import { RecoveryChart } from "../../components/charts/RecoveryChart";
import { getConversionStats, getTimeseries } from "../../lib/api";

const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID ?? "";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AnalyticsPage() {
  if (!merchantId) {
    throw new Error("Missing NEXT_PUBLIC_MERCHANT_ID");
  }

  const stats: ConversionStats = await getConversionStats(merchantId);
  const timeseries: TimeseriesData = await getTimeseries(merchantId, "30d");

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
              Detailed analytics
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Conversion performance</h1>
          </div>
          <p className="rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
            30-day performance view across checkout flows
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Conversion rate</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.conversionRate.toFixed(1)}%</p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Recovered revenue</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">
              {formatCurrency(stats.revenueRecovered)}
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Completed orders</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.completed}</p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-500">Recovered checkouts</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.recovered}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <ConversionChart
          dates={timeseries.dates}
          orders={timeseries.orders}
          completions={timeseries.completions}
          recoveries={timeseries.recoveries}
        />
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Drop-off behavior</h2>
            <p className="mt-2 text-sm text-slate-500">
              Analyze payment method abandonment across the last 30 days.
            </p>
            <div className="mt-6">
              <MethodBreakdown
                card={stats.dropOffByMethod.card}
                bankTransfer={stats.dropOffByMethod.bankTransfer}
                ussd={stats.dropOffByMethod.ussd}
                qr={stats.dropOffByMethod.qr}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-950">Recovery cadence</h2>
            <p className="mt-2 text-sm text-slate-500">
              Recovered checkout volume over the last 30 days to help spot improvement opportunities.
            </p>
            <div className="mt-6">
              <RecoveryChart dates={timeseries.dates} recoveries={timeseries.recoveries} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
