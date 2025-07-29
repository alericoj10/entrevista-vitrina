import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(price);
}

export function simulatePayment(
  finalPrice: number,
  paymentMethod: string
): "approved" | "rejected" {
  const lastDigit = finalPrice % 10;

  if (paymentMethod === "card") {
    return lastDigit < 8 ? "approved" : "rejected";
  }

  return "approved";
}
