"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ConversionChartProps = Readonly<{
  dates: string[];
  orders: number[];
  completions: number[];
  recoveries: number[];
}>;

export function ConversionChart({ dates, orders, completions, recoveries }: ConversionChartProps) {
  const data = dates.map((date, index) => ({
    date,
    orders: orders[index] ?? 0,
    completions: completions[index] ?? 0,
    recoveries: recoveries[index] ?? 0,
  }));

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-950">Checkout performance</h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value: number) => value.toString()} />
            <Legend wrapperStyle={{ paddingTop: 12 }} />
            <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="recoveries" stroke="#f59e0b" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
