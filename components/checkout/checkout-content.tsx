"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { PaymentMethods } from "@/components/checkout/payment-methods"
import { ShippingOptions } from "@/components/checkout/shipping-options"
import { CheckoutSteps } from "@/components/checkout/checkout-steps"
import { ShoppingCart, Lock, Truck, CreditCard, User } from "lucide-react"
import Link from "next/link"
import type { AuthUser } from "@/lib/auth"
import axios from "axios"
import { toast } from "sonner"

interface CheckoutContentProps {
  user?: AuthUser | null
}

export function CheckoutContent({ user }: CheckoutContentProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("paystack")
  const [cartItems, setCartItems] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [shippingData, setShippingData] = useState<any>(null)

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) {
        const guestCart = localStorage.getItem("guest-cart")
        if (guestCart) {
          setCartItems(JSON.parse(guestCart))
        }
        setIsLoading(false)
        return
      }

      try {
        const response = await axios.get("/api/cart")
        setCartItems(response.data.items || [])
      } catch (error) {
        console.error("Failed to fetch cart items:", error)
        toast.error("Failed to load cart items")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCartItems()
  }, [user])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = subtotal >= 5000 ? 0 : shippingMethod === "express" ? 2000 : 1000
  const tax = 0
  const total = subtotal + shippingCost + tax

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6 max-w-md mx-auto">
          <div className="text-8xl">🛒</div>
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">Add some spice blends to your cart before checking out.</p>
          <Button size="lg" asChild>
            <Link href="/products">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Start Shopping
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold gradient-text">Secure Checkout</h1>
          <p className="text-muted-foreground">Complete your order for premium spice blends</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>SSL Encrypted & Secure</span>
          </div>
        </div>

        {/* Checkout Steps */}
        <CheckoutSteps currentStep={currentStep} />

        {/* Guest Checkout Notice */}
        {!user && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Sign in for faster checkout</p>
                    <p className="text-sm text-muted-foreground">Save your details and track your orders easily</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/auth/login">Sign In</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/auth/signup">Create Account</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={`step-${currentStep}`} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="step-1" disabled={currentStep < 1}>
                  <Truck className="h-4 w-4 mr-2" />
                  Shipping
                </TabsTrigger>
                <TabsTrigger value="step-2" disabled={currentStep < 2}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment
                </TabsTrigger>
                <TabsTrigger value="step-3" disabled={currentStep < 3}>
                  <Lock className="h-4 w-4 mr-2" />
                  Review
                </TabsTrigger>
              </TabsList>

              <TabsContent value="step-1" className="mt-6">
                <div className="space-y-6">
                  <CheckoutForm
                    user={user}
                    onNext={() => setCurrentStep(2)}
                    onDataChange={(data) => setShippingData(data)}
                  />
                  <ShippingOptions
                    selectedMethod={shippingMethod}
                    onMethodChange={setShippingMethod}
                    subtotal={subtotal}
                  />
                </div>
              </TabsContent>

              <TabsContent value="step-2" className="mt-6">
                <PaymentMethods
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                  onNext={() => setCurrentStep(3)}
                  onBack={() => setCurrentStep(1)}
                  total={total}
                  user={user}
                  shippingData={shippingData}
                  cartItems={cartItems}
                  shippingMethod={shippingMethod}
                />
              </TabsContent>

              <TabsContent value="step-3" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Review Your Order</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📋</div>
                      <h3 className="text-xl font-semibold mb-2">Order Review</h3>
                      <p className="text-muted-foreground mb-4">
                        Review your order details before completing your purchase
                      </p>
                      <div className="flex space-x-4 justify-center">
                        <Button variant="outline" onClick={() => setCurrentStep(2)}>
                          Back to Payment
                        </Button>
                        <Button>Complete Order</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={cartItems}
              subtotal={subtotal}
              shipping={shippingCost}
              tax={tax}
              total={total}
              shippingMethod={shippingMethod}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
