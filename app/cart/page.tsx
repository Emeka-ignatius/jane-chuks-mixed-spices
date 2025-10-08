import { CartContent } from "@/components/cart/cart-content";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const user = await getCurrentUser();
  console.log({ user });

  return (
    <div className="min-h-screen">
      <CartContent user={user} />
    </div>
  );
}

export const metadata = {
  title: "Shopping Cart - JaneChuks Mixed Spices",
  description: "Review your selected spice blends and proceed to checkout",
};
