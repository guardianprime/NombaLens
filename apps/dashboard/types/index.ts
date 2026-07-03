export type ConversionStats = {
  totalOrders: number;
  completed: number;
  abandoned: number;
  recovered: number;
  conversionRate: number;
  revenueRecovered: number;
  dropOffByMethod: {
    card: number;
    bankTransfer: number;
    ussd: number;
    qr: number;
  };
};

export type TimeseriesData = {
  dates: string[];
  orders: number[];
  completions: number[];
  recoveries: number[];
};

export type RecoverySession = {
  id: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "recovered";
  createdAt: string;
  recoveredAt?: string;
};

export type SplitConfig = {
  subAccountId: string;
  subAccountName: string;
  percentage: number;
};

export type Alert = {
  id: string;
  title: string;
  description: string;
  severity: "warning" | "critical" | "info";
};
