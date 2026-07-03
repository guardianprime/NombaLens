"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type RecoveryChartProps = Readonly<{
  dates: string[];
  recoveries: number[];
}>;

export function RecoveryChart({ dates, recoveries }: RecoveryChartProps) {
  const data = dates.map((date, index) => ({
    date,
    recoveries: recoveries[index] ?? 0,
  }));

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-950">Recovered revenue trend</h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value: number) => value.toString()} />
            <Area type="monotone" dataKey="recoveries" stroke="#f59e0b" fill="#fef3c7" fillOpacity={0.7} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
