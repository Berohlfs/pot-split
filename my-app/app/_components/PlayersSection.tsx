"use client";

import type { AppState, BuyInMode, Player } from "../_lib/types";
import { playerBuyIn, untracedChange } from "../_lib/calc";
import {
  Card,
  DecimalInput,
  IntegerInput,
  SegmentedControl,
  TextInput,
  formatCurrency,
} from "./ui";

type Props = {
  state: AppState;
  maxPlayers: number;
  onAddPlayer: () => void;
  onUpdatePlayer: (id: string, patch: Partial<Player>) => void;
  onRemovePlayer: (id: string) => void;
  onSetBuyInPrice: (price: number) => void;
  onSetMode: (mode: BuyInMode) => void;
};

const MODE_HINT: Record<BuyInMode, string> = {
  fixed: "Same price per buy-in. Players add stacks as needed (tournament-style).",
  free: "Each player enters their own total buy-in (cash game-style).",
};

export function PlayersSection({
  state,
  maxPlayers,
  onAddPlayer,
  onUpdatePlayer,
  onRemovePlayer,
  onSetBuyInPrice,
  onSetMode,
}: Props) {
  const totalBuyIn = state.players.reduce(
    (s, p) => s + playerBuyIn(p, state),
    0,
  );
  const totalChips = state.players.reduce((s, p) => s + p.endingChips, 0);
  const diff = untracedChange(state);
  const atMax = state.players.length >= maxPlayers;
  const isFixed = state.mode === "fixed";

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
      <div className="mb-4 space-y-3">
        <div className="flex flex-col gap-1">
          <span className="pb-1 pl-1 pt-0.5 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Buy-in mode
          </span>
          <SegmentedControl<BuyInMode>
            value={state.mode}
            onChange={onSetMode}
            options={[
              { value: "fixed", label: "Fixed", hint: MODE_HINT.fixed },
              { value: "free", label: "Free", hint: MODE_HINT.free },
            ]}
          />
          <p className="pl-2 pt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {MODE_HINT[state.mode]}
          </p>
        </div>

        {isFixed && (
          <label className="flex max-w-xs flex-col gap-1 text-sm pl-1">
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              Buy-in price
            </span>
            <DecimalInput
              value={state.buyInPrice}
              onChange={onSetBuyInPrice}
              prefix="$"
            />
          </label>
        )}
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
                <th className="px-4 py-2 font-medium sm:px-2">
                  {isFixed ? "Buy-ins" : "Buy-in"}
                </th>
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
                    {isFixed ? (
                      <IntegerInput
                        value={p.buyIns}
                        onChange={(buyIns) =>
                          onUpdatePlayer(p.id, { buyIns })
                        }
                      />
                    ) : (
                      <DecimalInput
                        value={p.buyInAmount}
                        onChange={(buyInAmount) =>
                          onUpdatePlayer(p.id, { buyInAmount })
                        }
                        prefix="$"
                      />
                    )}
                  </td>
                  <td className="px-4 py-2 sm:px-2">
                    <DecimalInput
                      value={p.endingChips}
                      onChange={(endingChips) =>
                        onUpdatePlayer(p.id, { endingChips })
                      }
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
