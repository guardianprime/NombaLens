"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MethodBreakdownProps = Readonly<{
  card: number;
  bankTransfer: number;
  ussd: number;
  qr: number;
}>;

export function MethodBreakdown({ card, bankTransfer, ussd, qr }: MethodBreakdownProps) {
  const data = [
    { method: "Card", value: card },
    { method: "Bank Transfer", value: bankTransfer },
    { method: "USSD", value: ussd },
    { method: "QR", value: qr },
  ];

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-slate-950">Drop-off by payment method</h2>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="method" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value: number) => value.toString()} />
            <Bar dataKey="value" fill="#ef4444" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
