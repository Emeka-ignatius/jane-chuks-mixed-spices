"use server";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getAdminStats() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return { error: "Unauthorized" };
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") {
      return { error: "Unauthorized" };
    }

    // Get total users
    const totalUsers = await db.user.count();

    // Get total products sold
    const productsSold = await db.orderItem.aggregate({
      _sum: {
        quantity: true,
      },
    });

    // Get active orders (pending, processing, shipped)
    const activeOrders = await db.order.count({
      where: {
        status: {
          in: ["pending", "processing", "shipped"],
        },
      },
    });

    // Get total revenue
    const revenue = await db.order.aggregate({
      where: {
        paymentStatus: "paid",
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Get recent orders
    const recentOrders = await db.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return {
      data: {
        totalUsers,
        productsSold: productsSold._sum.quantity || 0,
        activeOrders,
        revenue: revenue._sum.totalAmount || 0,
        recentOrders: recentOrders.map((order) => ({
          id: order.orderNumber,
          customer: order.user?.name || "Guest",
          product: order.orderItems || "N/A",
          amount: Number(order.totalAmount),
          status: order.status,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return { error: "Failed to fetch admin stats" };
  }
}

export async function getAdminProducts() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token) {
      return { error: "Unauthorized" };
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") {
      return { error: "Unauthorized" };
    }

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
