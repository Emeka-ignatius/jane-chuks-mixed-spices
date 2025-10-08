import { redirect } from "next/navigation"
import { OrdersContent } from "@/components/orders/orders-content"
import { getCurrentUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export default async function OrdersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login?redirect=/orders")
  }

  return <OrdersContent />
}
