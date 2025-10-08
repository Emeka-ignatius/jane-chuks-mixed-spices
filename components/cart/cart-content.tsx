"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Minus, Plus, X, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import type { AuthUser } from "@/lib/auth";
import axios from "axios";

interface CartContentProps {
  user?: AuthUser | null;
}

export function CartContent({ user }: CartContentProps) {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) {
        const guestCart = localStorage.getItem("guest-cart");
        if (guestCart) {
          setCartItems(JSON.parse(guestCart));
        }
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get("/api/cart");
        const normalize = (rows: any[]) =>
          rows.map((r) => ({
            id: r.productId ?? r.product_id ?? r.product?.id ?? r.id,
            productId: r.productId ?? r.product_id ?? r.product?.id ?? r.id,
            quantity: r.quantity ?? 1,
            name: r.name ?? r.product?.name,
            price: Number(r.price ?? r.product?.price ?? 0),
            image: r.image_url ?? r.imageUrl ?? r.product?.imageUrl,
            slug: r.slug ?? r.product?.slug,
            stockQuantity: Number(
              r.stock_quantity ?? r.product?.stockQuantity ?? 0
            ),
          }));

        setCartItems(normalize(response.data.items || []));
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
        toast.error("Failed to load cart items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [user]);

  const updateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }

    try {
      if (user) {
        await axios.put("/api/cart", { productId: id, quantity: newQuantity });
      } else {
        // Update guest cart in localStorage
        const updatedCart = cartItems.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedCart);
        localStorage.setItem("guest-cart", JSON.stringify(updatedCart));
      }

      setCartItems((items) =>
        items.map((item) =>
          item.id === id ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success("Cart updated");
    } catch (error) {
      toast.error("Failed to update cart");
    }
  };

  const removeItem = async (id: number) => {
    try {
      if (user) {
        await axios.delete(`/api/cart?productId=${id}`);
      } else {
        // Remove from guest cart in localStorage
        const updatedCart = cartItems.filter((item) => item.id !== id);
        setCartItems(updatedCart);
        localStorage.setItem("guest-cart", JSON.stringify(updatedCart));
      }

      setCartItems((items) => items.filter((item) => item.id !== id));
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal >= 5000 ? 0 : 1000; // Free shipping above ₦5,000
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="text-8xl">🛒</div>
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">
            Looks like you haven't added any spice blends to your cart yet.
            Start shopping to fill it up!
          </p>
          <Button size="lg" asChild>
            <Link href="/products">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Start Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold gradient-text">Shopping Cart</h1>
          <p className="text-muted-foreground">
            Review your selected items and proceed to checkout
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex space-x-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.image_url || item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-balance">
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Weight: {item.weight || "50g"}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {item.category === "multipurpose"
                              ? "Multi-Purpose"
                              : item.category === "women"
                              ? "For Women"
                              : "For Men"}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 bg-transparent"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-semibold">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ₦{item.price.toLocaleString()} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "text-green-600" : ""}>
                      {shipping === 0
                        ? "Free"
                        : `₦${shipping.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">
                    ₦{total.toLocaleString()}
                  </span>
                </div>

                {shipping > 0 && (
                  <div className="text-xs text-muted-foreground text-center p-2 bg-muted rounded">
                    Add ₦{(5000 - subtotal).toLocaleString()} more for free
                    shipping
                  </div>
                )}

                <Button size="lg" className="w-full" asChild>
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full bg-transparent"
                  asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3 text-center">
                  <h4 className="font-medium text-sm">Why Shop With Us?</h4>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div>🔒 Secure checkout</div>
                    <div>🚚 Fast delivery across Nigeria</div>
                    <div>↩️ 30-day return policy</div>
                    <div>✅ NAFDAC certified products</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
