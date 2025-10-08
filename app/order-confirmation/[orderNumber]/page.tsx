import { notFound } from "next/navigation";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";
import { db } from "@/lib/db";

interface OrderConfirmationPageProps {
  params: Promise<{ orderNumber: string; trackingNumber: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { orderNumber, trackingNumber } = await params;

  const order = await db.order.findFirst({
    where: { orderNumber, trackingNumber },
    include: { orderItems: true },
  });

  if (!order) {
    notFound();
  }

  const productIds = order.orderItems.map((i) => i.productId).filter(Boolean);
  const products = productIds.length
    ? await db.product.findMany({
        where: { id: { in: productIds ? [] : [] } },
        select: { id: true, imageUrl: true },
      })
    : [];
  const imageById = Object.fromEntries(products.map((p) => [p.id, p.imageUrl]));

  const uiOrder = {
    orderNumber: order.orderNumber,
    trackingNumber: order.trackingNumber ?? "",
    status:
      order.paymentStatus === "paid"
        ? "confirmed"
        : String(order.status).toLowerCase(),
    total: Number(order.totalAmount ?? 0),
    items: order.orderItems.map((i) => ({
      id: i.productId!,
      name: i.productName,
      price: Number(i.productPrice ?? 0),
      quantity: Number(i.quantity ?? 1),
      image: imageById[i.productId!],
    })),
    shippingAddress: {
      name: [order.shippingFirstName, order.shippingLastName]
        .filter(Boolean)
        .join(" "),
      address: [
        order.shippingAddressLine1,
        order.shippingAddressLine2,
        order.shippingCity,
        order.shippingState,
        order.shippingCountry,
      ]
        .filter(Boolean)
        .join(", "),
    },
    estimatedDelivery: "3–5 business days",
  };

  return (
    <div className="min-h-screen">
      <OrderConfirmation order={uiOrder} />
    </div>
  );
}

export async function generateMetadata({ params }: OrderConfirmationPageProps) {
  return {
    title: `Order ${(await params).orderNumber} – JaneChuks Mixed Spices`,
    description: "Your order has been confirmed",
  };
}
