"use server";

import { cookies } from "next/headers";
import { getCurrentUser, verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

function assertAdmin(user: any) {
  if (!user || !user.isAdmin) {
    throw new Error("Unauthorized");
  }
}

export async function getAdminStats() {
  try {
    const user = await getCurrentUser();
    // trust DB/session, not cookies in this action
    const isAdmin =
      !!user &&
      (user.isAdmin === true ||
        (typeof user.role === "string" && user.role.toUpperCase() === "ADMIN"));

    if (!isAdmin) {
      return { error: "Unauthorized" };
    }

    const totalUsers = await db.user.count();

    const productsSoldAgg = await db.orderItem.aggregate({
      _sum: { quantity: true },
    });
    const productsSold = productsSoldAgg._sum.quantity ?? 0;

    const activeOrders = await db.order.count({
      where: { status: { in: ["pending", "processing", "shipped"] } },
    });

    const revenueAgg = await db.order.aggregate({
      where: { paymentStatus: "paid" },
      _sum: { totalAmount: true },
    });
    const revenue = Number(revenueAgg._sum.totalAmount ?? 0);

    const recent = await db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        orderItems: {
          select: {
            productName: true,
            // include the related product name too, in case you want it
            product: { select: { name: true } },
          },
        },
      },
    });

    const recentOrders = recent.map((o) => {
      // show first item + “+N more”
      const firstName =
        o.orderItems[0]?.product?.name ?? o.orderItems[0]?.productName ?? "—";
      const more =
        o.orderItems.length > 1 ? ` +${o.orderItems.length - 1} more` : "";
      return {
        id: o.orderNumber,
        customer: o.user?.name || o.user?.email || "Guest",
        product: `${firstName}${more}`,
        amount: Number(o.totalAmount ?? 0),
        status: o.status,
      };
    });

    return {
      data: {
        totalUsers,
        productsSold,
        activeOrders,
        revenue,
        recentOrders,
      },
    };
  } catch (err) {
    console.error("Error fetching admin stats:", err);
    return { error: "Failed to fetch admin stats" };
  }
}

export async function getAdminProducts() {
  try {
    const user = await getCurrentUser();
    assertAdmin(user);

    const products = await db.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    return {
      data: products.map((product) => ({
        id: product.id,
        name: product.name,
        category: product.category,
        price: Number(product.price),
        stock: product.stockQuantity,
        status: product.stockQuantity > 20 ? "Active" : "Low Stock",
        image: product.imageUrl,
        sold: product._count.orderItems,
      })),
    };
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return { error: "Failed to fetch products" };
  }
}

export async function getAdminOrders() {
  try {
    const user = await getCurrentUser();
    assertAdmin(user);

    const rows = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        orderItems: {
          select: {
            id: true,
            productName: true,
            productPrice: true,
            quantity: true,
            totalPrice: true,
          },
        },
      },
    });

    // Map to the snake_case shape your UI expects
    const data = rows.map((o) => ({
      id: o.id,
      order_number: o.orderNumber,
      user_name: o.user?.name || "Guest",
      user_email: o.user?.email || "",
      status: o.status, // "pending" | "processing" | ...
      payment_status: o.paymentStatus || "pending",
      total_amount: Number(o.totalAmount ?? 0),
      shipping_amount: Number(o.shippingAmount ?? 0),
      tax_amount: Number(o.taxAmount ?? 0),
      currency: o.currency || "NGN",

      shipping_first_name: o.shippingFirstName || "",
      shipping_last_name: o.shippingLastName || "",
      shipping_address_line_1: o.shippingAddressLine1 || "",
      shipping_address_line_2: o.shippingAddressLine2 || "",
      shipping_city: o.shippingCity || "",
      shipping_state: o.shippingState || "",
      shipping_postal_code: o.shippingPostalCode || "",
      shipping_country: o.shippingCountry || "",
      shipping_phone: o.shippingPhone || "",

      payment_method: o.paymentMethod || "",
      tracking_number: o.trackingNumber || "",
      shipped_at: o.shippedAt ? o.shippedAt.toISOString() : null,
      delivered_at: o.deliveredAt ? o.deliveredAt.toISOString() : null,
      created_at: o.createdAt.toISOString(),

      items: o.orderItems.map((it) => ({
        id: it.id,
        product_name: it.productName,
        product_price: Number(it.productPrice ?? 0),
        quantity: it.quantity,
        total_price: Number(
          it.totalPrice ?? it.quantity * Number(it.productPrice ?? 0)
        ),
      })),
    }));

    return { data };
  } catch (err: any) {
    return { error: err?.message || "Failed to load orders" };
  }
}

export async function updateAdminOrderStatus({
  id,
  orderNumber,
  status,
}: {
  id?: string;
  orderNumber?: string;
  status: string;
}) {
  const user = await getCurrentUser();
  assertAdmin(user);

  const where = id ? { id } : orderNumber ? { orderNumber } : null;

  if (!where) return { error: "Missing id or orderNumber" };

  // (optional) set timestamps when moving to shipped/delivered
  const patch: any = { status };
  const now = new Date();
  if (status === "shipped") patch.shippedAt = now;
  if (status === "delivered") patch.deliveredAt = now;

  try {
    const updated = await db.order.update({ where, data: patch });
    return { data: { id: updated.id, status: updated.status } };
  } catch (e: any) {
    if (e?.code === "P2025") return { error: "Order not found" };
    return { error: "Failed to update status" };
  }
}

export async function updateAdminTracking({
  id,
  orderNumber,
  trackingNumber,
}: {
  id?: string;
  orderNumber?: string;
  trackingNumber: string;
}) {
  const user = await getCurrentUser();
  assertAdmin(user);

  const where = id ? { id } : orderNumber ? { orderNumber } : null;

  if (!where) return { error: "Missing id or orderNumber" };

  try {
    const updated = await db.order.update({
      where,
      data: { trackingNumber },
    });
    return {
      data: { id: updated.id, tracking_number: updated.trackingNumber },
    };
  } catch (e: any) {
    if (e?.code === "P2025") return { error: "Order not found" };
    return { error: "Failed to update tracking" };
  }
}
