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
    millions >= 10 ? millions.toFixed(0) : millions.toFixed(1);
  return `${formatted} M KZT`;
}

export function formatPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
