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

function inputClass(prefix?: string) {
  return `w-full rounded-md border border-zinc-200 bg-white py-1.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-500 dark:focus:ring-zinc-800 ${
    prefix ? "pl-6 pr-2.5" : "px-2.5"
  }`;
}

function PrefixWrap({
  prefix,
  children,
}: {
  prefix?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex items-center">
      {prefix && (
        <span className="pointer-events-none absolute left-2 text-xs text-zinc-400">
          {prefix}
        </span>
      )}
      {children}
    </div>
  );
}

// Allows digits and a single decimal separator with at most two fractional
// digits. Commas are normalized to dots. Anything else is dropped before it
// ever reaches the buffer.
const MAX_DECIMALS = 2;
function sanitizeDecimal(raw: string): string {
  const normalized = raw.replace(/,/g, ".");
  let seenDot = false;
  let fracDigits = 0;
  let out = "";
  for (const ch of normalized) {
    if (ch >= "0" && ch <= "9") {
      if (seenDot) {
        if (fracDigits >= MAX_DECIMALS) continue;
        fracDigits++;
      }
      out += ch;
    } else if (ch === "." && !seenDot) {
      out += ".";
      seenDot = true;
    }
  }
  return out;
}

function sanitizeInteger(raw: string): string {
  return raw.replace(/[^0-9]/g, "");
}

function parseDecimal(buffer: string): number {
  if (buffer === "" || buffer === ".") return 0;
  const n = Number(buffer);
  return Number.isFinite(n) ? n : 0;
}

export function DecimalInput({
  value,
  onChange,
  prefix,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  ariaLabel?: string;
}) {
  const [draft, setDraft] = useState(() =>
    Number.isFinite(value) ? sanitizeDecimal(String(value)) : "",
  );

  useEffect(() => {
    setDraft((current) => {
      if (parseDecimal(current) === value) return current;
      return Number.isFinite(value) ? sanitizeDecimal(String(value)) : "";
    });
  }, [value]);

  return (
    <PrefixWrap prefix={prefix}>
      <input
        type="text"
        inputMode="decimal"
        value={draft}
        aria-label={ariaLabel}
        onChange={(e) => {
          const cleaned = sanitizeDecimal(e.target.value);
          setDraft(cleaned);
          onChange(parseDecimal(cleaned));
        }}
        onBlur={() => {
          // Canonicalize: strip a trailing dot ("12." -> "12"), drop leading
          // zeros except for fractional values ("007" -> "7", "0.5" stays).
          setDraft((cur) => {
            if (cur === "" || cur === ".") return "";
            let s = cur;
            if (s.endsWith(".")) s = s.slice(0, -1);
            if (s.startsWith(".")) s = "0" + s;
            // Strip leading zeros from the integer portion.
            const [intPart, fracPart] = s.split(".");
            const trimmedInt = intPart.replace(/^0+(?=\d)/, "");
            return fracPart !== undefined
              ? `${trimmedInt || "0"}.${fracPart}`
              : trimmedInt || "0";
          });
        }}
        className={inputClass(prefix)}
      />
    </PrefixWrap>
  );
}

export function IntegerInput({
  value,
  onChange,
  prefix,
  ariaLabel,
}: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  ariaLabel?: string;
}) {
  const [draft, setDraft] = useState(() =>
    Number.isFinite(value) ? String(Math.trunc(value)) : "",
  );

  useEffect(() => {
    setDraft((current) => {
      const parsed = current === "" ? 0 : Number(current);
      if (parsed === value) return current;
      return Number.isFinite(value) ? String(Math.trunc(value)) : "";
    });
  }, [value]);

  return (
    <PrefixWrap prefix={prefix}>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        aria-label={ariaLabel}
        onChange={(e) => {
          const cleaned = sanitizeInteger(e.target.value);
          setDraft(cleaned);
          onChange(cleaned === "" ? 0 : Number(cleaned));
        }}
        onBlur={() => {
          setDraft((cur) => {
            if (cur === "") return "";
            const trimmed = cur.replace(/^0+(?=\d)/, "");
            return trimmed === "" ? "0" : trimmed;
          });
        }}
        className={inputClass(prefix)}
      />
    </PrefixWrap>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; hint?: string }[];
}) {
  return (
    <div
      role="radiogroup"
      className="inline-flex rounded-md border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            title={opt.hint}
            onClick={() => onChange(opt.value)}
            className={`rounded px-3 py-1 text-sm font-medium transition ${
              active
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
