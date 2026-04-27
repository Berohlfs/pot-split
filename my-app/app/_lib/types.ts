export type BuyInMode = "fixed" | "free";

export type Player = {
  id: string;
  name: string;
  buyIns: number;
  buyInAmount: number;
  endingChips: number;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  sharedAmong: string[];
};

export type AppState = {
  mode: BuyInMode;
  players: Player[];
  buyInPrice: number;
  expenses: Expense[];
};

export type Settlement = {
  from: string;
  to: string;
  amount: number;
};

export type PlayerNet = {
  playerId: string;
  gameNet: number;
  expenseShare: number;
  expensePaid: number;
  expenseNet: number;
  /** Game + expense share only (excludes reimbursable / cash advanced). */
  personalNet: number;
  total: number;
};
