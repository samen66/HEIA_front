import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKzt(value: number): string {
  return new Intl.NumberFormat("en-KZ", {
    style: "currency",
    currency: "KZT",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMillionsKzt(value: number): string {
  const millions = value / 1_000_000;
  const formatted =
    millions >= 10
      ? Math.round(millions).toLocaleString("en-US")
      : millions.toLocaleString("en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        });
  return `${formatted} M KZT`;
}

export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

function escapeCsvCell(value: string | number | undefined | null): string {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Trigger a browser download of CSV built from column headers and row objects. */
export function downloadCsv(
  filename: string,
  columns: { key: string; header: string }[],
  rows: Record<string, string | number | undefined>[],
): void {
  const headerLine = columns.map((c) => escapeCsvCell(c.header)).join(",");
  const body = rows
    .map((row) =>
      columns.map((c) => escapeCsvCell(row[c.key])).join(","),
    )
    .join("\n");
  const blob = new Blob([`${headerLine}\n${body}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
