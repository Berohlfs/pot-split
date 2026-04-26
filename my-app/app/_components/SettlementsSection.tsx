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
                Math.abs(n.total) < 0.005
                  ? "text-zinc-500"
                  : n.total > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-600 dark:text-red-400";
              return (
                <li
                  key={n.playerId}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {nameById.get(n.playerId)}
                  </span>
                  <span className={`font-semibold tabular-nums ${tone}`}>
                    {n.total >= 0 ? "+" : ""}
                    {formatCurrency(n.total)}
                  </span>
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
