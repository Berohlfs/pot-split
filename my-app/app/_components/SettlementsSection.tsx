"use client";

import { useMemo } from "react";
import type { AppState } from "../_lib/types";
import { computeNets, computeSettlements } from "../_lib/calc";
import { Card, formatCurrency } from "./ui";

export function SettlementsSection({ state }: { state: AppState }) {
  const { nets, settlements, nameById } = useMemo(() => {
    const nets = computeNets(state);
    const settlements = computeSettlements(nets);
    const nameById = new Map(
      state.players.map((p) => [p.id, p.name || "(unnamed)"]),
    );
    return { nets, settlements, nameById };
  }, [state]);

  if (state.players.length === 0) {
    return (
      <Card title="Settlement">
        <p className="rounded-md border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Add players to see settlements.
        </p>
      </Card>
    );
  }

  return (
    <Card
      title="Settlement"
      subtitle="Net per player and the cash transfers to settle up"
    >
      <div className="space-y-4">
        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Per-player net
          </h3>
          <ul className="divide-y divide-zinc-100 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {nets.map((n) => {
              const tone =
                Math.abs(n.personalNet) < 0.005
                  ? "text-zinc-500"
                  : n.personalNet > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400";
              const hasShare = Math.abs(n.expenseShare) >= 0.005;
              const hasPaid = Math.abs(n.expensePaid) >= 0.005;
              const showBreakdown = hasShare || hasPaid;
              return (
                <li key={n.playerId} className="px-3 py-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {nameById.get(n.playerId)}
                    </span>
                    <span className={`font-semibold tabular-nums ${tone}`}>
                      {n.personalNet >= 0 ? "+" : ""}
                      {formatCurrency(n.personalNet)}
                    </span>
                  </div>
                  {showBreakdown && (
                    <div className="mt-0.5 flex flex-wrap items-center justify-end gap-x-1.5 gap-y-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <BreakdownPart label="Game" value={n.gameNet} />
                      {hasShare && (
                        <>
                          <span aria-hidden="true">·</span>
                          <BreakdownPart
                            label="Expenses"
                            value={n.expenseShare}
                          />
                        </>
                      )}
                      {hasPaid && (
                        <>
                          <span aria-hidden="true">·</span>
                          <BreakdownPart
                            label="Reimbursable"
                            value={n.expenseNet}
                          />
                        </>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Transfers
          </h3>
          {settlements.length === 0 ? (
            <p className="rounded-md border border-dashed border-zinc-300 px-3 py-4 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
              All square — no payments needed.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {settlements.map((s, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-2 text-sm dark:bg-zinc-800/60"
                >
                  <span className="text-zinc-700 dark:text-zinc-300">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {nameById.get(s.from)}
                    </span>{" "}
                    pays{" "}
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {nameById.get(s.to)}
                    </span>
                  </span>
                  <span className="font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(s.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Card>
  );
}

function signed(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "−" : "";
  return `${sign}${formatCurrency(Math.abs(value))}`;
}

function BreakdownPart({ label, value }: { label: string; value: number }) {
  const tone =
    Math.abs(value) < 0.005
      ? "text-zinc-500 dark:text-zinc-400"
      : value > 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-red-600 dark:text-red-400";
  return (
    <span className="tabular-nums">
      <span className="text-zinc-500 dark:text-zinc-400">{label} </span>
      <span className={tone}>{signed(value)}</span>
    </span>
  );
}
