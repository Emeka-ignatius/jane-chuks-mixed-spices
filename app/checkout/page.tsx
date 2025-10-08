import { getCurrentUser } from "@/lib/auth";
import { CheckoutContent } from "@/components/checkout/checkout-content";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  // For now, allow guest checkout but encourage login
  // In a real app, you might require authentication

  return (
    <div className="min-h-screen bg-muted/30">
      <CheckoutContent user={user} />
    </div>
  );
}

export const metadata = {
  title: "Checkout - JaneChuks Mixed Spices",
  description: "Complete your order for premium spice blends",
};
