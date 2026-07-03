export interface TransactionLike {
  paymentMethod?: string | null;
}

export interface RankedPaymentMethod {
  paymentMethod: string;
  count: number;
}

export function rankPaymentMethods(transactions: TransactionLike[]): RankedPaymentMethod[] {
  const counts = new Map<string, number>();

  for (const transaction of transactions) {
    const paymentMethod = transaction.paymentMethod?.trim();

    if (!paymentMethod) {
      continue;
    }

    counts.set(paymentMethod, (counts.get(paymentMethod) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([paymentMethod, count]) => ({ paymentMethod, count }))
    .sort((left, right) => right.count - left.count || left.paymentMethod.localeCompare(right.paymentMethod));
}
