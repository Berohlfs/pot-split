"use client";

import type { AppState, Expense } from "../_lib/types";
import { Card, DecimalInput, TextInput } from "./ui";

type Props = {
  state: AppState;
  onAddExpense: () => void;
  onUpdateExpense: (id: string, patch: Partial<Expense>) => void;
  onRemoveExpense: (id: string) => void;
};

export function ExpensesSection({
  state,
  onAddExpense,
  onUpdateExpense,
  onRemoveExpense,
}: Props) {
  const noPlayers = state.players.length === 0;

  return (
    <Card
      title="Expenses"
      subtitle="Pizza, drinks, etc. — split among the players who shared it"
      action={
        <button
          type="button"
          onClick={onAddExpense}
          disabled={noPlayers}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          + Add expense
        </button>
      }
    >
      {noPlayers ? (
        <p className="rounded-md border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          Add players first.
        </p>
      ) : state.expenses.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No expenses yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {state.expenses.map((e) => (
            <ExpenseRow
              key={e.id}
              expense={e}
              players={state.players}
              onUpdate={(patch) => onUpdateExpense(e.id, patch)}
              onRemove={() => onRemoveExpense(e.id)}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}

function ExpenseRow({
  expense,
  players,
  onUpdate,
  onRemove,
}: {
  expense: Expense;
  players: AppState["players"];
  onUpdate: (patch: Partial<Expense>) => void;
  onRemove: () => void;
}) {
  const toggleShare = (playerId: string) => {
    const next = expense.sharedAmong.includes(playerId)
      ? expense.sharedAmong.filter((id) => id !== playerId)
      : [...expense.sharedAmong, playerId];
    onUpdate({ sharedAmong: next });
  };

  return (
    <li className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">
            Description
          </span>
          <TextInput
            value={expense.description}
            onChange={(description) => onUpdate({ description })}
            placeholder="Pizza, drinks…"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">
            Amount
          </span>
          <div className="w-32">
            <DecimalInput
              value={expense.amount}
              onChange={(amount) => onUpdate({ amount })}
              prefix="$"
            />
          </div>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">
            Paid by
          </span>
          <select
            value={expense.paidBy}
            onChange={(e) => onUpdate({ paidBy: e.target.value })}
            className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
          >
            {players.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name || "(unnamed)"}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end justify-end">
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-medium text-zinc-400 transition hover:text-red-500"
          >
            Remove
          </button>
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Shared among
        </div>
        <div className="flex flex-wrap gap-1.5">
          {players.map((p) => {
            const active = expense.sharedAmong.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggleShare(p.id)}
                className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : "border-zinc-300 bg-white text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
                }`}
              >
                {p.name || "(unnamed)"}
              </button>
            );
          })}
        </div>
      </div>
    </li>
  );
}
