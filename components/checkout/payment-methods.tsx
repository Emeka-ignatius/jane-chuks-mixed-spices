"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { usePaystackPayment } from "react-paystack";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
import type { AuthUser } from "@/lib/auth";
import { fmtNGN } from "@/lib/utils";

interface PaymentMethodsProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  onNext: () => void;
  onBack: () => void;
  total: number;
  user?: AuthUser | null;
  shippingData: any;
  cartItems: any[];
  shippingMethod: string;
}

export function PaymentMethods({
  selectedMethod,
  onMethodChange,
  onNext,
  onBack,
  total,
  user,
  shippingData,
  cartItems,
  shippingMethod,
}: PaymentMethodsProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const config = {
    reference: `JCS-${Date.now()}`,
    email: user?.email || shippingData?.email || "",
    amount: total * 100, // Paystack expects amount in kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_xxx",
    currency: "NGN",
  };
  const initializePayment = usePaystackPayment(config); // Moved hook call to top level

  const onSuccess = async (reference: any) => {
    setIsProcessing(true);
    try {
      // Create order in database
      const orderData = {
        userId: user?.id,
        items: cartItems,
        shippingAddress: shippingData,
        shippingMethod,
        paymentMethod: "paystack",
        paymentReference: reference.reference,
        total,
        status: "pending",
        paymentStatus: "paid",
      };

      const response = await axios.post("/api/orders", orderData);

      if (response.data.success) {
        // Clear cart
        if (user) {
          await axios.delete("/api/cart/clear");
        } else {
          localStorage.removeItem("guest-cart");
        }

        toast.success("Payment successful! Order placed.");
        router.push(`/order-confirmation/${response.data.orderNumber}`);
      }
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error(
        "Payment successful but order creation failed. Please contact support."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const onClose = () => {
    toast.error("Payment cancelled");
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const paymentMethods = [
    {
      id: "paystack",
      name: "Paystack",
      description: "Pay with card, bank transfer, or USSD",
      icon: CreditCard,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!shippingData) {
      toast.error("Please complete shipping information first");
      onBack();
      return;
    }

    if (selectedMethod === "paystack" && initializePayment) {
      initializePayment({ onSuccess, onClose });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Payment Method</span>
        </CardTitle>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup
            value={selectedMethod}
            onValueChange={onMethodChange}
            className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="relative">
                <div
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                    selectedMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}>
                  <RadioGroupItem value={method.id} id={method.id} />
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="p-2 rounded-lg bg-muted">
                      <method.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <Label
                        htmlFor={method.id}
                        className="font-medium cursor-pointer">
                        {method.name}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>

          <div className="p-4 bg-primary/5 rounded-lg">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span className="text-primary">{fmtNGN(total)}</span>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Shipping
            </Button>
            <Button type="submit" className="flex-1" disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Pay Now"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
