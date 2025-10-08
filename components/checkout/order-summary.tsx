import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Truck, Gift } from "lucide-react"
import Image from "next/image"

interface OrderSummaryProps {
  items: Array<{
    id: number
    name: string
    price: number
    quantity: number
    image: string
    category: string
    weight: string
  }>
  subtotal: number
  shipping: number
  tax: number
  total: number
  shippingMethod: string
}

export function OrderSummary({ items, subtotal, shipping, tax, total, shippingMethod }: OrderSummaryProps) {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "men":
        return { label: "For Men", className: "bg-secondary" }
      case "women":
        return { label: "For Women", className: "bg-accent" }
      case "multipurpose":
        return { label: "Multi-Purpose", className: "bg-primary" }
      default:
        return { label: category, className: "bg-muted" }
    }
  }

  const getShippingLabel = (method: string) => {
    switch (method) {
      case "express":
        return "Express Delivery (2-3 days)"
      case "same-day":
        return "Same Day Delivery"
      default:
        return "Standard Delivery (5-7 days)"
    }
  }

  return (
    <div className="space-y-6">
      {/* Order Items */}
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <span>Order Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Items List */}
          <div className="space-y-4">
            {items.map((item) => {
              const badge = getCategoryBadge(item.category)
              return (
                <div key={item.id} className="flex space-x-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-contain p-2" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                      {item.quantity}
                    </Badge>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-sm leading-tight">{item.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={`text-xs ${badge.className}`}>
                        {badge.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.weight}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                      <span className="font-semibold text-sm">₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <Separator />

          {/* Pricing Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({items.length} items)</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Truck className="h-3 w-3" />
                <span>{getShippingLabel(shippingMethod)}</span>
              </div>
              <span className={shipping === 0 ? "text-green-600" : ""}>
                {shipping === 0 ? "Free" : `₦${shipping.toLocaleString()}`}
              </span>
            </div>
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax</span>
                <span>₦{tax.toLocaleString()}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary">₦{total.toLocaleString()}</span>
          </div>

          {/* Free Shipping Notice */}
          {shipping === 0 && subtotal >= 5000 && (
            <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-2 rounded">
              <Gift className="h-4 w-4" />
              <span>You saved ₦1,000 on shipping!</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trust Indicators */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3 text-center">
            <h4 className="font-medium text-sm">Secure Checkout</h4>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>🔒 SSL encrypted payment</div>
              <div>🚚 Tracked delivery</div>
              <div>↩️ 30-day return policy</div>
              <div>✅ NAFDAC certified products</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
