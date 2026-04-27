"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AppState, BuyInMode, Expense, Player } from "../_lib/types";
import {
  decodeState,
  emptyState,
  encodeState,
  URL_PARAM,
} from "../_lib/url";
import { PlayersSection } from "./PlayersSection";
import { ExpensesSection } from "./ExpensesSection";
import { SettlementsSection } from "./SettlementsSection";
import { ShareButton } from "./ShareButton";

const MAX_PLAYERS = 10;

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function ChipLogo() {
  return (
    <div className="relative h-10 w-14 shrink-0">
      <PokerChip
        color="rgb(37, 99, 235)"
        className="absolute left-0 top-1 -rotate-12"
      />
      <PokerChip
        color="rgb(5, 150, 105)"
        className="absolute left-3 top-0 z-10"
      />
      <PokerChip
        color="rgb(220, 38, 38)"
        className="absolute left-6 top-1 rotate-12"
      />
    </div>
  );
}

function PokerChip({
  color,
  className,
}: {
  color: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <div
        className="relative h-8 w-8 rounded-full shadow-sm ring-1 ring-black/10 dark:ring-white/10"
        style={{
          background: `repeating-conic-gradient(${color} 0deg 30deg, white 30deg 60deg)`,
        }}
      >
        <div
          className="absolute inset-1 rounded-full"
          style={{ background: color }}
        >
          <div className="absolute inset-1.5 rounded-full border border-white/40" />
        </div>
      </div>
    </div>
  );
}

export function PotSplitter() {
  const searchParams = useSearchParams();
  const initial = useMemo(() => {
    return decodeState(searchParams.get(URL_PARAM)) ?? emptyState();
  }, [searchParams]);
  const [state, setState] = useState<AppState>(initial);
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.set(URL_PARAM, encodeState(state));
    window.history.replaceState(null, "", `?${params.toString()}`);
  }, [state]);

  const addPlayer = () => {
    if (state.players.length >= MAX_PLAYERS) return;
    const player: Player = {
      id: newId(),
      name: `Player ${state.players.length + 1}`,
      buyIns: 1,
      buyInAmount: state.buyInPrice || 0,
      endingChips: 0,
    };
    setState((s) => ({ ...s, players: [...s.players, player] }));
  };

  const updatePlayer = (id: string, patch: Partial<Player>) => {
    setState((s) => ({
      ...s,
      players: s.players.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }));
  };

  const removePlayer = (id: string) => {
    setState((s) => ({
      ...s,
      players: s.players.filter((p) => p.id !== id),
      expenses: s.expenses
        .filter((e) => e.paidBy !== id)
        .map((e) => ({
          ...e,
          sharedAmong: e.sharedAmong.filter((pid) => pid !== id),
        })),
    }));
  };

  const setBuyInPrice = (price: number) => {
    setState((s) => ({ ...s, buyInPrice: price }));
  };

  const setMode = (mode: BuyInMode) => {
    setState((s) => {
      // When switching to free, seed each player's free amount from their fixed
      // buy-ins so the user doesn't lose the work they already entered.
      if (mode === "free" && s.mode !== "free") {
        return {
          ...s,
          mode,
          players: s.players.map((p) =>
            p.buyInAmount === 0
              ? { ...p, buyInAmount: p.buyIns * s.buyInPrice }
              : p,
          ),
        };
      }
      return { ...s, mode };
    });
  };

  const addExpense = () => {
    if (state.players.length === 0) return;
    const expense: Expense = {
      id: newId(),
      description: "",
      amount: 0,
      paidBy: state.players[0].id,
      sharedAmong: state.players.map((p) => p.id),
    };
    setState((s) => ({ ...s, expenses: [...s.expenses, expense] }));
  };

  const updateExpense = (id: string, patch: Partial<Expense>) => {
    setState((s) => ({
      ...s,
      expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  };

  const removeExpense = (id: string) => {
    setState((s) => ({
      ...s,
      expenses: s.expenses.filter((e) => e.id !== id),
    }));
  };

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <ChipLogo />
            <div>
              <h1 className="font-title text-xl leading-none tracking-wider text-zinc-900 dark:text-zinc-50">
                POT SPLITTER
              </h1>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Settle the table after a Texas Hold&apos;em night
              </p>
            </div>
          </div>
          <ShareButton />
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-5">
        <div className="space-y-6 md:col-span-3">
          <PlayersSection
            state={state}
            maxPlayers={MAX_PLAYERS}
            onAddPlayer={addPlayer}
            onUpdatePlayer={updatePlayer}
            onRemovePlayer={removePlayer}
            onSetBuyInPrice={setBuyInPrice}
            onSetMode={setMode}
          />
          <ExpensesSection
            state={state}
            onAddExpense={addExpense}
            onUpdateExpense={updateExpense}
            onRemoveExpense={removeExpense}
          />
        </div>
        <div className="md:col-span-2">
          <div className="md:sticky md:top-20">
            <SettlementsSection state={state} />
          </div>
        </div>
      </main>
    </div>
  );
}
