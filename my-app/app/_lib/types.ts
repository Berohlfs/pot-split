export type Player = {
  id: string;
  name: string;
  cacifes: number;
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
  players: Player[];
  cacifePrice: number;
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
  expenseNet: number;
  total: number;
};
