"use client";

import { ReactNode, useEffect, useState } from "react";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return currency.format(value);
}

export function Card({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
    />
  );
}

export function NumberInput({
  value,
  onChange,
  min,
  step,
  prefix,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  prefix?: string;
}) {
  // Local string buffer so the user can clear / type freely without the parent
  // clamping to 0 mid-typing.
  const [draft, setDraft] = useState(() => formatNumberForInput(value));

  useEffect(() => {
    setDraft((current) => {
      const parsed = current === "" ? NaN : Number(current);
      if (!Number.isNaN(parsed) && parsed === value) return current;
      return formatNumberForInput(value);
    });
  }, [value]);

  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="pointer-events-none absolute left-2 text-xs text-zinc-400">
          {prefix}
        </span>
      )}
      <input
        type="number"
        inputMode="decimal"
        value={draft}
        min={min}
        step={step}
        onChange={(e) => {
          const next = e.target.value;
          setDraft(next);
          if (next === "" || next === "-") {
            onChange(0);
            return;
          }
          const parsed = Number(next);
          if (!Number.isNaN(parsed)) onChange(parsed);
        }}
        onBlur={() => setDraft(formatNumberForInput(value))}
        className={`w-full rounded-md border border-zinc-200 bg-white py-1.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800 ${
          prefix ? "pl-6 pr-2.5" : "px-2.5"
        }`}
      />
    </div>
  );
}

function formatNumberForInput(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return Number.isInteger(value) ? String(value) : String(value);
}
