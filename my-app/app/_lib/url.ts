import type { AppState } from "./types";

export const URL_PARAM = "data";

export function emptyState(): AppState {
  return { players: [], cacifePrice: 0, expenses: [] };
}

export function encodeState(state: AppState): string {
  return encodeURIComponent(JSON.stringify(state));
}

export function decodeState(raw: string | null): AppState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    const s = parsed as Partial<AppState>;
    if (
      !Array.isArray(s.players) ||
      typeof s.cacifePrice !== "number" ||
      !Array.isArray(s.expenses)
    ) {
      return null;
    }
    const players = s.players.filter(
      (p): p is AppState["players"][number] =>
        !!p &&
        typeof p === "object" &&
        typeof p.id === "string" &&
        typeof p.name === "string" &&
        typeof p.cacifes === "number" &&
        typeof p.endingChips === "number",
    );
    const expenses = s.expenses.filter(
      (e): e is AppState["expenses"][number] =>
        !!e &&
        typeof e === "object" &&
        typeof e.id === "string" &&
        typeof e.description === "string" &&
        typeof e.amount === "number" &&
        typeof e.paidBy === "string" &&
        Array.isArray(e.sharedAmong) &&
        e.sharedAmong.every((id) => typeof id === "string"),
    );
    return { players, cacifePrice: s.cacifePrice, expenses };
  } catch {
    return null;
  }
}
