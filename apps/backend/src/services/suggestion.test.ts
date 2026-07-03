import test from "node:test";
import assert from "node:assert/strict";

import { rankPaymentMethods } from "./suggestion.js";

test("ranks payment methods by frequency", () => {
  const transactions = [
    { paymentMethod: "card" },
    { paymentMethod: "bank_transfer" },
    { paymentMethod: "card" },
    { paymentMethod: "cash" },
    { paymentMethod: "bank_transfer" },
    { paymentMethod: "bank_transfer" },
  ];

  const ranked = rankPaymentMethods(transactions as Array<{ paymentMethod?: string }>);

  assert.deepEqual(
    ranked.map((entry) => entry.paymentMethod),
    ["bank_transfer", "card", "cash"],
  );
});
