import type { AppState, Player, PlayerNet, Settlement } from "./types";

const toCents = (n: number) => Math.round(n * 100);
const fromCents = (n: number) => n / 100;

export function playerBuyIn(p: Player, state: AppState): number {
  return state.mode === "fixed" ? p.buyIns * state.buyInPrice : p.buyInAmount;
}

function playerBuyInCents(p: Player, state: AppState): number {
  return toCents(playerBuyIn(p, state));
}

export function untracedChange(state: AppState): number {
  const buyInCents = state.players.reduce(
    (sum, p) => sum + playerBuyInCents(p, state),
    0,
  );
  const chipCents = state.players.reduce(
    (sum, p) => sum + toCents(p.endingChips),
    0,
  );
  return fromCents(chipCents - buyInCents);
}

export function computeNets(state: AppState): PlayerNet[] {
  const n = state.players.length;
  if (n === 0) return [];

  const buyInCents = state.players.map((p) => playerBuyInCents(p, state));
  const chipCents = state.players.map((p) => toCents(p.endingChips));

  const totalBuyIn = buyInCents.reduce((a, b) => a + b, 0);
  const totalChips = chipCents.reduce((a, b) => a + b, 0);
  const diff = totalChips - totalBuyIn;

  // Bring sum(adjustedChips) to sum(buyIns) by subtracting diff/N from each
  // player's chips. The integer-cent remainder is spread one cent at a time
  // across the first |remainder| players so the totals are exact.
  const baseShare = Math.trunc(diff / n);
  const remainder = diff - baseShare * n;
  const adjustedChipCents = chipCents.map((c, i) => {
    const extra = i < Math.abs(remainder) ? Math.sign(remainder) : 0;
    return c - baseShare - extra;
  });

  const gameNetCents = state.players.map(
    (_, i) => adjustedChipCents[i] - buyInCents[i],
  );

  const expensePaidCents = new Array<number>(n).fill(0);
  const expenseShareCents = new Array<number>(n).fill(0);
  for (const e of state.expenses) {
    if (e.sharedAmong.length === 0) continue;
    const amountCents = toCents(e.amount);
    const shareBase = Math.trunc(amountCents / e.sharedAmong.length);
    const shareRemainder = amountCents - shareBase * e.sharedAmong.length;

    const payerIdx = state.players.findIndex((p) => p.id === e.paidBy);
    if (payerIdx >= 0) expensePaidCents[payerIdx] += amountCents;

    e.sharedAmong.forEach((pid, i) => {
      const idx = state.players.findIndex((p) => p.id === pid);
      if (idx < 0) return;
      const owed = shareBase + (i < shareRemainder ? 1 : 0);
      expenseShareCents[idx] -= owed;
    });
  }

  return state.players.map((p, i) => {
    const expenseNetCents = expensePaidCents[i] + expenseShareCents[i];
    return {
      playerId: p.id,
      gameNet: fromCents(gameNetCents[i]),
      expenseShare: fromCents(expenseShareCents[i]),
      expensePaid: fromCents(expensePaidCents[i]),
      expenseNet: fromCents(expenseNetCents),
      personalNet: fromCents(gameNetCents[i] + expenseShareCents[i]),
      total: fromCents(gameNetCents[i] + expenseNetCents),
    };
  });
}

export function computeSettlements(nets: PlayerNet[]): Settlement[] {
  const balances = nets.map((n) => ({
    id: n.playerId,
    cents: Math.round(n.total * 100),
  }));

  const settlements: Settlement[] = [];
  // Greedy: largest debtor pays largest creditor until everyone's flat.
  while (true) {
    balances.sort((a, b) => a.cents - b.cents);
    const debtor = balances[0];
    const creditor = balances[balances.length - 1];
    if (!debtor || !creditor) break;
    if (debtor.cents >= 0 || creditor.cents <= 0) break;

    const amount = Math.min(-debtor.cents, creditor.cents);
    settlements.push({
      from: debtor.id,
      to: creditor.id,
      amount: fromCents(amount),
    });
    debtor.cents += amount;
    creditor.cents -= amount;
  }
  return settlements;
}
