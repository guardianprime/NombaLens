import type { Alert, ConversionStats, TimeseriesData } from "../types/index";
import { AlertPanel } from "../components/AlertPanel";
import { ConversionChart } from "../components/charts/ConversionChart";
import { MethodBreakdown } from "../components/charts/MethodBreakdown";
import { getAlerts, getConversionStats, getTimeseries } from "../lib/api";

const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID ?? "";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default async function HomePage() {
  if (!merchantId) {
    throw new Error("Missing NEXT_PUBLIC_MERCHANT_ID");
  }

  const stats: ConversionStats = await getConversionStats(merchantId);
  const timeseries: TimeseriesData = await getTimeseries(merchantId, "7d");
  const { alerts } = await getAlerts(merchantId);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">
                Conversion overview
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">
                Merchant analytics
              </h1>
            </div>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              Live data
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Total orders</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.totalOrders}</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Completed</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.completed}</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Abandoned</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.abandoned}</p>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-500">Recovered</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950">{stats.recovered}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Recovery revenue</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {formatCurrency(stats.revenueRecovered)}
              </p>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              {formatPercent(stats.conversionRate)} conversion
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-[2rem] bg-slate-50 p-4">
              <span className="text-sm text-slate-500">Card</span>
              <span className="text-sm font-semibold text-slate-900">{stats.dropOffByMethod.card}</span>
            </div>
            <div className="flex items-center justify-between rounded-[2rem] bg-slate-50 p-4">
              <span className="text-sm text-slate-500">Bank transfer</span>
              <span className="text-sm font-semibold text-slate-900">{stats.dropOffByMethod.bankTransfer}</span>
            </div>
            <div className="flex items-center justify-between rounded-[2rem] bg-slate-50 p-4">
              <span className="text-sm text-slate-500">USSD</span>
              <span className="text-sm font-semibold text-slate-900">{stats.dropOffByMethod.ussd}</span>
            </div>
            <div className="flex items-center justify-between rounded-[2rem] bg-slate-50 p-4">
              <span className="text-sm text-slate-500">QR</span>
              <span className="text-sm font-semibold text-slate-900">{stats.dropOffByMethod.qr}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">Alerts</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">Unusual activity</h2>
          </div>
        </div>
        <AlertPanel alerts={alerts} />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <ConversionChart
          dates={timeseries.dates}
          orders={timeseries.orders}
          completions={timeseries.completions}
          recoveries={timeseries.recoveries}
        />
        <MethodBreakdown
          card={stats.dropOffByMethod.card}
          bankTransfer={stats.dropOffByMethod.bankTransfer}
          ussd={stats.dropOffByMethod.ussd}
          qr={stats.dropOffByMethod.qr}
        />
      </section>
    </div>
  );
}
