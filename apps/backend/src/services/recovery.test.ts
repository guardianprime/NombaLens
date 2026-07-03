import test from "node:test";
import assert from "node:assert/strict";

import { buildRecoveryEmailPayload } from "./recovery.js";

test("builds a recovery email payload for a checkout session", () => {
  const payload = buildRecoveryEmailPayload("customer@example.com", "order_123");

  assert.equal(payload.to, "customer@example.com");
  assert.match(payload.subject, /order_123/);
  assert.match(payload.html, /order_123/);
  assert.match(payload.text, /order_123/);
});
