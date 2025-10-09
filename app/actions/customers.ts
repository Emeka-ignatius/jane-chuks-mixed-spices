"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

function assertAdmin(user: any) {
  if (!user || !user.isAdmin) {
    throw new Error("Unauthorized");
  }
}

export async function getCustomers() {
  try {
    const user = await getCurrentUser();
    const isAdmin =
      !!user &&
      (user.isAdmin === true ||
        (typeof user.role === "string" && user.role.toUpperCase() === "ADMIN"));

    if (!isAdmin) {
      return { error: "Unauthorized" };
    }

    const customers = await db.user.findMany({
      where: {
        isAdmin: false,
        role: "CUSTOMER",
      },
      include: {
        orders: {
          select: {
            totalAmount: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formattedCustomers = customers.map((customer) => {
      const totalOrders = customer.orders.length;
      const totalSpent = customer.orders.reduce(
        (sum, order) => sum + Number(order.totalAmount),
        0
      );
      const lastOrderDate = customer.orders[0]?.createdAt || null;

      // Determine status based on recent activity
      let status = "inactive";
      if (lastOrderDate) {
        const daysSinceLastOrder = Math.floor(
          (new Date().getTime() - new Date(lastOrderDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        if (daysSinceLastOrder <= 30) {
          status = "active";
        }
      }

      // Check if customer is new (joined within last 30 days)
      const daysSinceJoin = Math.floor(
        (new Date().getTime() - new Date(customer.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSinceJoin <= 30) {
        status = "new";
      }

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        totalOrders,
        totalSpent,
        joinDate: customer.createdAt.toISOString(),
        lastOrderDate: lastOrderDate?.toISOString() || null,
        status,
      };
    });

    return { data: formattedCustomers };
  } catch (error) {
    console.error("[v0] Error fetching customers:", error);
    return { error: "Failed to fetch customers" };
  }
}

export async function getCustomerDetails(customerId: string) {
  try {
    const user = await getCurrentUser();
    assertAdmin(user);

    const customer = await db.user.findUnique({
      where: { id: customerId },
      include: {
        addresses: {
          orderBy: {
            isDefault: "desc",
          },
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!customer) {
      return { error: "Customer not found" };
    }

    const totalOrders = customer.orders.length;
    const totalSpent = customer.orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0
    );
    const lastOrderDate = customer.orders[0]?.createdAt || null;

    // Determine status
    let status = "inactive";
    if (lastOrderDate) {
      const daysSinceLastOrder = Math.floor(
        (new Date().getTime() - new Date(lastOrderDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastOrder <= 30) {
        status = "active";
      }
    }

    const daysSinceJoin = Math.floor(
      (new Date().getTime() - new Date(customer.createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    if (daysSinceJoin <= 30) {
      status = "new";
    }

    return {
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        totalOrders,
        totalSpent,
        joinDate: customer.createdAt.toISOString(),
        lastOrderDate: lastOrderDate?.toISOString() || null,
        status,
        addresses: customer.addresses.map((addr) => ({
          id: addr.id,
          type: addr.type,
          firstName: addr.firstName,
          lastName: addr.lastName,
          addressLine1: addr.addressLine1,
          addressLine2: addr.addressLine2,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postalCode,
          country: addr.country,
          phone: addr.phone,
          isDefault: addr.isDefault,
        })),
        recentOrders: customer.orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          totalAmount: Number(order.totalAmount),
          status: order.status,
          createdAt: order.createdAt.toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error(" Error fetching customer details:", error);
    return { error: "Failed to fetch customer details" };
  }
}
