import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { customAlphabet } from "nanoid";

export const dynamic = "force-dynamic";

const nano = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 10);
const clamp = (v: any, max: number) =>
  v == null ? null : String(v).slice(0, max);

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await request.json();

    const {
      items = [],
      shippingAddress = {},
      shippingMethod,
      paymentMethod,
      paymentReference,
      total,
      shippingAmount = 0,
      taxAmount = 0,
      currency = "NGN",
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items" }, { status: 400 });
    }

    // Build safe, short values
    const orderNumber = clamp(`JCS-${nano()}`, 50);
    const trackingNumber = clamp(`JCS-TRK-${nano()}`, 100);
    const paymentMethodClamped = clamp(paymentMethod ?? "paystack", 50);
    const paymentReferenceClamped = clamp(paymentReference ?? "", 255);
    const currencyClamped = clamp(String(currency).toUpperCase(), 3);

    // Map shipping object into columns (respect lengths)
    const s = shippingAddress || {};
    const shippingFirstName = clamp(s.firstName, 100);
    const shippingLastName = clamp(s.lastName, 100);
    const shippingAddressLine1 = clamp(s.addressLine1 ?? s.address, 255);
    const shippingAddressLine2 = clamp(s.addressLine2, 255);
    const shippingCity = clamp(s.city, 100);
    const shippingState = clamp(s.state, 100);
    const shippingPostalCode = clamp(s.postalCode, 20);
    const shippingCountry = clamp(s.country ?? "Nigeria", 100);
    const shippingPhone = clamp(s.phone, 20);

    const order = await db.order.create({
      data: {
        userId: user.id,
        orderNumber: orderNumber!,
        status: "pending", // or OrderStatus.PENDING
        paymentStatus: "paid", // or PaymentStatus.PAID (if you confirm payment here)
        paymentMethod: paymentMethodClamped,
        paymentReference: paymentReferenceClamped,
        currency: currencyClamped!,
        shippingAmount: Number(shippingAmount) || 0,
        taxAmount: Number(taxAmount) || 0,
        totalAmount: Number(total) || 0,

        // shipping columns
        shippingFirstName,
        shippingLastName,
        shippingAddressLine1,
        shippingAddressLine2,
        shippingCity,
        shippingState,
        shippingPostalCode,
        shippingCountry,
        shippingPhone,
        trackingNumber,
        orderItems: {
          create: items.map((item: any) => ({
            productId: String(item.productId ?? item.id),
            productName: clamp(item.name, 255)!,
            quantity: Number(item.quantity) || 1,
            productPrice: Number(item.price) || 0,
            totalPrice:
              (Number(item.price) || 0) * (Number(item.quantity) || 1),
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    // Clear user's cart if logged in
    await db.cartItem.deleteMany({
      where: { userId: user.id },
    });

    await db.user.updateMany({
      where: { id: user.id, role: "VISITOR" },
      data: { role: "CUSTOMER" },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      order,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
