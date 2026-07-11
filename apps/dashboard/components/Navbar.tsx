import Link from "next/link";
import { getAlerts } from "../lib/api";

const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID ?? "";

export default async function Navbar() {
  const { alerts } = merchantId ? await getAlerts(merchantId) : { alerts: [] };
  const alertCount = alerts.length;

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">
            NombaLens
          </p>
          <p className="text-sm text-slate-600">Merchant analytics</p>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
            <Link
              href="/"
              className="rounded-2xl px-3 py-2 transition hover:bg-slate-100"
            >
              Overview
            </Link>
            <a
              href="/recovery"
              className="rounded-2xl px-3 py-2 transition hover:bg-slate-100"
            >
              Recovery
            </a>
            <a
              href="/split"
              className="rounded-2xl px-3 py-2 transition hover:bg-slate-100"
            >
              Split
            </a>
            <a
              href="/analytics"
              className="rounded-2xl px-3 py-2 transition hover:bg-slate-100"
            >
              Analytics
            </a>
          </nav>

          {alertCount > 0 ? (
            <div className="rounded-full bg-rose-100 px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm">
              {alertCount} alert{alertCount > 1 ? "s" : ""}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
