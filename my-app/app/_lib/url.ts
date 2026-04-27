import type { AppState, BuyInMode, Player } from "./types";

export const URL_PARAM = "data";

export function emptyState(): AppState {
  return { mode: "fixed", players: [], buyInPrice: 0, expenses: [] };
}

export function encodeState(state: AppState): string {
  return encodeURIComponent(JSON.stringify(state));
}

export function decodeState(raw: string | null): AppState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const s = parsed as Record<string, unknown>;

    const mode: BuyInMode = s.mode === "free" ? "free" : "fixed";
    const buyInPrice =
      typeof s.buyInPrice === "number" ? s.buyInPrice : 0;
    if (!Array.isArray(s.players) || !Array.isArray(s.expenses)) return null;

    const players: Player[] = s.players
      .map((p): Player | null => {
        if (!p || typeof p !== "object") return null;
        const r = p as Record<string, unknown>;
        if (typeof r.id !== "string" || typeof r.name !== "string") return null;
        const buyIns =
          typeof r.buyIns === "number" ? r.buyIns : 0;
        const buyInAmount =
          typeof r.buyInAmount === "number" ? r.buyInAmount : 0;
        const endingChips =
          typeof r.endingChips === "number" ? r.endingChips : 0;
        return {
          id: r.id,
          name: r.name,
          buyIns,
          buyInAmount,
          endingChips,
        };
      })
      .filter((p): p is Player => p !== null);

    const expenses = s.expenses
      .map((e): AppState["expenses"][number] | null => {
        if (!e || typeof e !== "object") return null;
        const r = e as Record<string, unknown>;
        if (
          typeof r.id !== "string" ||
          typeof r.description !== "string" ||
          typeof r.amount !== "number" ||
          typeof r.paidBy !== "string" ||
          !Array.isArray(r.sharedAmong) ||
          !r.sharedAmong.every((id) => typeof id === "string")
        )
          return null;
        return {
          id: r.id,
          description: r.description,
          amount: r.amount,
          paidBy: r.paidBy,
          sharedAmong: r.sharedAmong as string[],
        };
      })
      .filter(
        (e): e is AppState["expenses"][number] => e !== null,
      );

    return { mode, players, buyInPrice, expenses };
  } catch {
    return null;
  }
}
