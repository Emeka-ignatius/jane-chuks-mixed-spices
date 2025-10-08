"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Truck, Zap, Clock } from "lucide-react"

interface ShippingOptionsProps {
  selectedMethod: string
  onMethodChange: (method: string) => void
  subtotal: number
}

export function ShippingOptions({ selectedMethod, onMethodChange, subtotal }: ShippingOptionsProps) {
  const shippingOptions = [
    {
      id: "standard",
      name: "Standard Delivery",
      description: "5-7 business days",
      price: subtotal >= 5000 ? 0 : 1000,
      icon: Truck,
      estimatedDays: "5-7 days",
    },
    {
      id: "express",
      name: "Express Delivery",
      description: "2-3 business days",
      price: subtotal >= 5000 ? 1000 : 2000,
      icon: Zap,
      estimatedDays: "2-3 days",
    },
    {
      id: "same-day",
      name: "Same Day Delivery",
      description: "Lagos & Abuja only",
      price: 3000,
      icon: Clock,
      estimatedDays: "Same day",
      restricted: true,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Truck className="h-5 w-5" />
          <span>Shipping Options</span>
        </CardTitle>
        {subtotal >= 5000 && (
          <Badge className="w-fit bg-green-100 text-green-800 border-green-200">
            🎉 Free standard shipping unlocked!
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedMethod} onValueChange={onMethodChange} className="space-y-4">
          {shippingOptions.map((option) => (
            <div key={option.id} className="relative">
              <div
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  selectedMethod === option.id
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-muted-foreground/50"
                }`}
              >
                <RadioGroupItem value={option.id} id={option.id} />
                <div className="flex items-center space-x-3 flex-1">
                  <div className="p-2 rounded-lg bg-muted">
                    <option.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={option.id} className="font-medium cursor-pointer">
                        {option.name}
                      </Label>
                      {option.restricted && (
                        <Badge variant="outline" className="text-xs">
                          Limited
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                    <p className="text-xs text-muted-foreground">Estimated: {option.estimatedDays}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {option.price === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₦${option.price.toLocaleString()}`
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </RadioGroup>

        {subtotal < 5000 && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              💡 Add ₦{(5000 - subtotal).toLocaleString()} more to your order for free standard shipping!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
