import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmtNGN = (n: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);

export const fmtDate = (d?: string | Date | null) =>
  d ? new Date(d).toLocaleDateString() : "—";

export const addDays = (dateLike: string | Date | undefined, days: number) => {
  if (!dateLike) return null;
  const t = new Date(dateLike).getTime();
  return new Date(t + days * 86_400_000);
};

export const statusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "canceled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-neutral-100 text-neutral-700"; // pending/unknown
  }
};

 export const getInitials = (name?: string) => {
   if (!name) return "U";
   return name
     .split(" ")
     .map((n) => n[0])
     .join("")
     .toUpperCase()
     .slice(0, 2);
 };