import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(val: number) {
  const formatter = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  });
  
  return `Rs. ${formatter.format(val)}`;
}
