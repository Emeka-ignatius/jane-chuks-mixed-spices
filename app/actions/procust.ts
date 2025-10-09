"use server";

import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";

export async function deleteAdminProduct(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;
    const payload = token ? await verifyToken(token) : null;
    if (!payload || payload.role !== "ADMIN") return { error: "Unauthorized" };

    // block delete if there are order items referencing it
    const count = await db.orderItem.count({ where: { productId: id } });
    if (count > 0) {
      return {
        error:
          "This product has sales and cannot be deleted. Consider archiving or disabling it.",
      };
    }

    await db.product.delete({ where: { id } });
    return { ok: true };
  } catch (e: any) {
    console.error("deleteAdminProduct error:", e);
    return { error: "Failed to delete product" };
  }
}
