"use client";

import { useEffect, useMemo, useState } from "react";
import type { SplitConfig } from "../types/index";
import { getSplitConfig, saveSplitConfig } from "../lib/api";
import { Button } from "./ui/Button";

const merchantId = process.env.NEXT_PUBLIC_MERCHANT_ID ?? "";

export function SplitBuilder() {
  const [configs, setConfigs] = useState<SplitConfig[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const total = useMemo(
    () => configs.reduce((sum, config) => sum + config.percentage, 0),
    [configs],
  );

  useEffect(() => {
    if (!merchantId) {
      setErrorMessage("Missing merchant configuration.");
      return;
    }

    let canceled = false;

    getSplitConfig(merchantId)
      .then((result) => {
        if (!canceled) {
          setConfigs(result.configs);
        }
      })
      .catch(() => {
        if (!canceled) {
          setErrorMessage("Unable to load split configs.");
        }
      });

    return () => {
      canceled = true;
    };
  }, []);

  const canSave = total === 100 && configs.length > 0;

  function updatePercentage(index: number, value: number) {
    setConfigs((current) =>
      current.map((config, configIndex) =>
        configIndex === index ? { ...config, percentage: value } : config,
      ),
    );
  }

  async function handleSave() {
    if (!merchantId || !canSave) {
      return;
    }

    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await saveSplitConfig(
        merchantId,
        configs.map((config) => ({ subAccountId: config.subAccountId, percentage: config.percentage })),
      );
      setSuccessMessage("Split configuration saved successfully.");
    } catch {
      setErrorMessage("Failed to save split configuration.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">Split payments</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">No-code split builder</h2>
        </div>
        <div className="rounded-full bg-slate-50 px-4 py-2 text-sm text-slate-600">
          Total: <span className={total === 100 ? "font-semibold text-slate-950" : "font-semibold text-rose-600"}>{total}%</span>
        </div>
      </div>

      <div className="space-y-5">
        {configs.map((config, index) => (
          <div key={config.subAccountId} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">{config.subAccountName}</p>
                <p className="text-sm text-slate-500">{config.subAccountId}</p>
              </div>
              <p className="text-sm font-semibold text-slate-950">{config.percentage}%</p>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={config.percentage}
              onChange={(event) => updatePercentage(index, Number(event.target.value))}
              className="w-full accent-slate-900"
            />
          </div>
        ))}
      </div>

      {errorMessage ? (
        <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className={`text-sm ${total !== 100 ? "text-rose-600" : "text-slate-500"}`}>
          {total === 100
            ? "Your split totals 100%. Ready to apply."
            : "Adjust sliders until the split totals exactly 100%."}
        </p>
        <Button onClick={handleSave} disabled={!canSave || isSaving}>
          {isSaving ? "Saving…" : "Save split config"}
        </Button>
      </div>
    </div>
  );
}
