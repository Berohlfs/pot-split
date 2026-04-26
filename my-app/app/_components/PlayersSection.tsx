"use client";

import type { AppState, Player } from "../_lib/types";
import { untracedChange } from "../_lib/calc";
import { Card, NumberInput, TextInput, formatCurrency } from "./ui";

type Props = {
  state: AppState;
  maxPlayers: number;
  onAddPlayer: () => void;
  onUpdatePlayer: (id: string, patch: Partial<Player>) => void;
  onRemovePlayer: (id: string) => void;
  onSetCacifePrice: (price: number) => void;
};

export function PlayersSection({
  state,
  maxPlayers,
  onAddPlayer,
  onUpdatePlayer,
  onRemovePlayer,
  onSetCacifePrice,
}: Props) {
  const totalBuyIn = state.players.reduce(
    (s, p) => s + p.cacifes * state.cacifePrice,
    0,
  );
  const totalChips = state.players.reduce((s, p) => s + p.endingChips, 0);
  const diff = untracedChange(state);
  const atMax = state.players.length >= maxPlayers;

  return (
    <Card
      title="Players"
      subtitle={`${state.players.length} / ${maxPlayers}`}
      action={
        <button
          type="button"
          onClick={onAddPlayer}
          disabled={atMax}
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          + Add player
        </button>
      }
    >
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Cacife price
          </span>
          <NumberInput
            value={state.cacifePrice}
            onChange={onSetCacifePrice}
            min={0}
            step={1}
            prefix="$"
          />
        </label>
      </div>

      {state.players.length === 0 ? (
        <p className="rounded-md border border-dashed border-zinc-300 px-4 py-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No players yet. Add the first one to get started.
        </p>
      ) : (
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                <th className="px-4 py-2 font-medium sm:px-2">Name</th>
                <th className="px-4 py-2 font-medium sm:px-2">Cacifes</th>
                <th className="px-4 py-2 font-medium sm:px-2">Ending chips</th>
                <th className="px-4 py-2 font-medium sm:px-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {state.players.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2 sm:px-2">
                    <TextInput
                      value={p.name}
                      onChange={(name) => onUpdatePlayer(p.id, { name })}
                      placeholder="Name"
                    />
                  </td>
                  <td className="px-4 py-2 sm:px-2">
                    <NumberInput
                      value={p.cacifes}
                      onChange={(cacifes) => onUpdatePlayer(p.id, { cacifes })}
                      min={0}
                      step={1}
                    />
                  </td>
                  <td className="px-4 py-2 sm:px-2">
                    <NumberInput
                      value={p.endingChips}
                      onChange={(endingChips) =>
                        onUpdatePlayer(p.id, { endingChips })
                      }
                      min={0}
                      step={1}
                      prefix="$"
                    />
                  </td>
                  <td className="px-4 py-2 text-right sm:px-2">
                    <button
                      type="button"
                      onClick={() => onRemovePlayer(p.id)}
                      className="text-xs font-medium text-zinc-400 transition hover:text-red-500"
                      aria-label={`Remove ${p.name}`}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {state.players.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-2 rounded-md bg-zinc-50 p-3 text-sm sm:grid-cols-3 dark:bg-zinc-900">
          <Stat label="Total buy-in" value={formatCurrency(totalBuyIn)} />
          <Stat label="Total chips" value={formatCurrency(totalChips)} />
          <Stat
            label="Untraced change"
            value={formatCurrency(diff)}
            tone={
              Math.abs(diff) < 0.005
                ? "neutral"
                : diff > 0
                  ? "positive"
                  : "negative"
            }
            hint={
              Math.abs(diff) < 0.005
                ? "Books match"
                : "Will be split evenly across players"
            }
          />
        </div>
      )}
    </Card>
  );
}

function Stat({
  label,
  value,
  tone = "neutral",
  hint,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "positive" | "negative";
  hint?: string;
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-600 dark:text-emerald-400"
      : tone === "negative"
        ? "text-red-600 dark:text-red-400"
        : "text-zinc-900 dark:text-zinc-50";
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className={`text-base font-semibold ${toneClass}`}>{value}</div>
      {hint && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{hint}</div>
      )}
    </div>
  );
}
