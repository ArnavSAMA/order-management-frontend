import type { Order } from "./types";
import type { User } from "@/features/auth/types";

export function canViewOrder(user: User | null, order: Order) {
  if (!user) return false;
  if (user.role === "staff") return order.assignedTo === user.name;
  return true; // clerk + boss see all
}

export function canEditStatus(user: User | null, order: Order) {
  if (!user) return false;
  if (user.role === "clerk") return true;
  if (user.role === "staff") return order.assignedTo === user.name;
  return false; // boss
}

export function canEditAll(user: User | null) {
  return !!user && user.role === "clerk";
}

export function canDeleteOrder(user: User | null) {
  return !!user && user.role === "clerk";
}
