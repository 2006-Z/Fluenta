import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function humanizeFieldName(name: string): string {
  const spaced = name.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced
    .split(" ")
    .map((word) =>
      word.toLowerCase() === "id" ? "ID" : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
}
