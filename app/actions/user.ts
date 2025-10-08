"use server";

import { cookies } from "next/headers";
import { getCurrentUser, verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderDTO } from "@/lib/types";

export async function getUserOrders(): Promise<
  { orders: OrderDTO[] } | { error: string }
> {
  const user = await getCurrentUser();
  if (!user?.id) {
    return { error: "Please sign in to view your orders." };
  }

  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: {
      orderItems: {
        include: {
          product: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const shaped: OrderDTO[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    createdAt: o.createdAt.toISOString(),
    status: o.status,
    totalAmount: Number(o.totalAmount),
    trackingNumber: o.trackingNumber,
    orderItems: o.orderItems.map((it) => ({
      quantity: it.quantity,
      price: Number(it.productPrice),
      product: { name: it.product?.name ?? it.productName },
    })),
  }));

  return { orders: shaped };
}

// export async function getUserStats() {
//   try {
//     const cookieStore = await cookies();
//     const token = cookieStore.get("auth_token")?.value;

//     if (!token) {
//       return { error: "Not authenticated" };
//     }

//     const payload = await verifyToken(token);
//     if (!payload) {
//       return { error: "Invalid token" };
//     }

//     const [totalOrders, totalSpent] = await Promise.all([
//       db.order.count({
//         where: {
//           userId: String(payload.id),
//         },
//       }),
//       db.order.aggregate({
//         where: {
//           userId: String(payload.id),
//           status: {
//             in: ["delivered", "shipped", "processing"],
//           },
//         },
//         _sum: {
//           totalAmount: true,
//         },
//       }),
//     ]);

//     const totalSpentValue = totalSpent._sum.totalAmount
//       ? Number(totalSpent._sum.totalAmount)
//       : 0;
//     return {
//       totalOrders,
//       totalSpent: totalSpentValue,
//     };
//   } catch (error) {
//     console.error("Error fetching user stats:", error);
//     return { error: "Failed to fetch stats" };
//   }
// }
