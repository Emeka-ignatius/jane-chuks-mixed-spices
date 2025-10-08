"use server";

import { getCurrentUser } from "@/lib/auth";
import {
  getAllOrders,
  updateOrderStatus,
  updateOrderTracking,
} from "@/lib/database";
import { db } from "@/lib/db";

type RecentOrderItem = {
  id: string;
  productName: string;
  quantity: number;
  productPrice: number;
  totalPrice: number;
};

type UserStats = {
  totalOrders: number;
  totalSpent: number;
  // extend later if you want (e.g. lastOrderAt, favoriteCount, etc.)
};

export type RecentOrder = {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string; // ISO
  paymentStatus?: string | null;
  orderItems: RecentOrderItem[];
};

export async function getOrders() {
  try {
    const orders = await getAllOrders();
    return { data: orders, error: null };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { data: null, error: "Failed to fetch orders" };
  }
}

export async function getUserStats(): Promise<UserStats & { error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { totalOrders: 0, totalSpent: 0, error: "Unauthorized" };

    // Count all orders the user has ever placed
    const totalOrders = await db.order.count({
      where: { userId: user.id },
    });

    // Sum only PAID totals (so refunds/cancellations don’t inflate spend)
    const sumPaid = await db.order.aggregate({
      where: { userId: user.id, paymentStatus: "paid" },
      _sum: { totalAmount: true },
    });

    return {
      totalOrders,
      totalSpent: Number(sumPaid._sum.totalAmount ?? 0),
    };
  } catch (err) {
    console.error("getUserStats error:", err);
    return { totalOrders: 0, totalSpent: 0, error: "Failed to load stats" };
  }
}

export async function updateStatus(orderId: string, status: string) {
  try {
    const order = await updateOrderStatus(orderId, status);
    return { data: order, error: null };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { data: null, error: "Failed to update order status" };
  }
}

export async function updateTracking(orderId: string, trackingNumber: string) {
  try {
    const order = await updateOrderTracking(orderId, trackingNumber);
    return { data: order, error: null };
  } catch (error) {
    console.error("Error updating tracking number:", error);
    return { data: null, error: "Failed to update tracking number" };
  }
}

export async function getRecentOrders(
  limit = 5
): Promise<RecentOrder[] | { error: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Unauthorized" };

    const rows = await db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: Math.max(1, Math.min(limit, 20)),
      include: {
        orderItems: {
          select: {
            id: true,
            productName: true,
            quantity: true,
            productPrice: true,
            totalPrice: true,
          },
        },
      },
    });

    return rows.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      totalAmount: Number(o.totalAmount ?? 0),
      createdAt: o.createdAt.toISOString(),
      paymentStatus: o.paymentStatus,
      orderItems: o.orderItems.map((it) => ({
        id: it.id,
        productName: it.productName,
        quantity: it.quantity,
        productPrice: Number(it.productPrice ?? 0),
        totalPrice: Number(
          it.totalPrice ?? it.quantity * Number(it.productPrice ?? 0)
        ),
      })),
    }));
  } catch (err) {
    console.error("getRecentOrders error:", err);
    return { error: "Failed to load orders" };
  }
}
