"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Package,
  Truck,
  Mail,
  ArrowRight,
  Download,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface OrderConfirmationProps {
  order: {
    orderNumber: string;
    trackingNumber: string;
    status: string;
    total: number;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      image: string | null;
    }>;
    shippingAddress: {
      name: string;
      address: string;
    };
    estimatedDelivery: string;
  };
}

export function OrderConfirmation({ order }: OrderConfirmationProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold gradient-text">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your order. We've received your payment and will
              start processing your order shortly.
            </p>
          </div>
        </div>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order #{order.orderNumber}</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Confirmed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Tracking ID: #{order.trackingNumber}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="font-semibold">Items Ordered</h3>
              {order.items.map((item) => (
                <div key={item.id} className="flex space-x-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </span>
                      <span className="font-semibold">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Shipping Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.address}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Estimated Delivery</h3>
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span className="text-sm">{order.estimatedDelivery}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Order Total */}
            <div className="flex justify-between font-semibold text-lg">
              <span>Total Paid</span>
              <span className="text-primary">
                ₦{order.total.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium">Email Confirmation</h4>
                <p className="text-sm text-muted-foreground">
                  You'll receive an email confirmation with your order details
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium">Order Processing</h4>
                <p className="text-sm text-muted-foreground">
                  We'll prepare your spices with care and package them
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium">Shipping Updates</h4>
                <p className="text-sm text-muted-foreground">
                  Track your order with the tracking number we'll send you
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/profile?tab=orders">
              View Order Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={`/api/orders/${order.orderNumber}/receipt`}>
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>

        {/* Support */}
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you have any questions about your order, don't hesitate to
              contact us.
            </p>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact Support</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
