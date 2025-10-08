import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getCartItems as dbGetCartItems,
  addToCart,
  updateCartItemQuantity,
} from "@/lib/database";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function normalize(rows: any[]) {
  return rows.map((r) => {
    const productId = r.productId ?? r.product_id ?? r.product?.id ?? r.id;
    return {
      id: productId,
      productId: productId,
      quantity: Number(r.quantity ?? 1),
      name: r.name ?? r.product?.name,
      price: Number(r.price ?? r.product?.price ?? 0),
      image: r.image_url ?? r.imageUrl ?? r.product?.imageUrl ?? null,
      slug: r.slug ?? r.product?.slug ?? null,
      stockQuantity: Number(r.stock_quantity ?? r.product?.stockQuantity ?? 0),
    };
  });
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await dbGetCartItems(user.id);
    return NextResponse.json({ items: normalize(raw) });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log(" Cart POST request received");
    const user = await getCurrentUser();

    if (!user) {
      console.log(" User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(" User authenticated:", user.id);

    const body = await request.json();

    const { productId, quantity = 1 } = body ?? {};
    if (productId == null)
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    console.log(" Request data - productId:", productId, "quantity:", quantity);

    const pid = String(productId);
    const qty = Math.max(1, Number(quantity ?? 1));

    // const result = await addToCart(user.id, pid, qty);
    // const updated = await dbGetCartItems(user.id);

    const userRow = await db.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true },
    });

    if (!userRow) {
      return NextResponse.json(
        {
          error: "Current user not found in DB (DB mismatch?)",
          tips: [
            "Log DATABASE_URL at server to confirm",
            "Check that your admin tool is connected to the same DB",
          ],
          gotUserIdFromCookie: user.id,
        },
        { status: 500 }
      );
    }

    const productRow = await db.product.findUnique({
      where: { id: pid },
      select: { id: true, name: true },
    });
    if (!productRow) {
      return NextResponse.json(
        {
          error: "Unknown productId for this DB",
          gotProductId: pid,
          tip: "Send the REAL product.id, not slug or internal UI id",
        },
        { status: 400 }
      );
    }

    // 🔎 3) Count before
    const beforeCount = await db.cartItem.count({ where: { userId: user.id } });

    const result = await db.cartItem.upsert({
      where: { userId_productId: { userId: user.id, productId: pid } },
      update: { quantity: { increment: qty } },
      create: { userId: user.id, productId: pid, quantity: qty },
      select: { userId: true, productId: true, quantity: true },
    });

    const afterCount = await db.cartItem.count({ where: { userId: user.id } });
    const updated = await dbGetCartItems(user.id);

    return NextResponse.json({
      success: true,
      debug: {
        userId: user.id,
        productId: pid,
        beforeCount,
        afterCount,
        upsertResult: result,
      },
      items: updated,
    });
  } catch (error) {
    console.error(" Add to cart error:", error);
    return NextResponse.json(
      { error: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const productId = String(body.productId);
    const quantity = Number(body.quantity);

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await updateCartItemQuantity(user.id, productId, quantity);
    return NextResponse.json({ success: true, item: result });
  } catch (error) {
    console.error("Update cart error:", error);
    return NextResponse.json(
      { error: "Failed to update cart item" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = String(
      new URL(request.url).searchParams.get("productId")
    );

    if (!productId) {
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );
    }

    await updateCartItemQuantity(user.id, productId, 0);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove from cart error:", error);
    return NextResponse.json(
      { error: "Failed to remove item from cart" },
      { status: 500 }
    );
  }
}
