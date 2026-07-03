import { SplitBuilder } from "../../components/SplitBuilder";

export default function SplitPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">Split configuration</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Split payment builder</h1>
          </div>
          <p className="rounded-3xl bg-slate-50 px-4 py-2 text-sm text-slate-600">
            Configure sub-account allocation for orders
          </p>
        </div>
      </section>

      <SplitBuilder />
    </div>
  );
}
