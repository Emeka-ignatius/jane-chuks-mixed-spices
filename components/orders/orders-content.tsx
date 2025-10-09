"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Search,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  DownloadIcon,
} from "lucide-react";
import { OrderTrackingModal } from "./order-tracking-modal";
import { getUserOrders } from "@/app/actions/user";
import { toast } from "sonner";
import { fmtDate, fmtNGN, statusBadge } from "@/lib/utils";

type Order = {
  id: string;
  orderNumber: string;
  createdAt: Date;
  status: string;
  totalAmount: number;
  trackingNumber: string | null;
  shippedAt: string | Date;
  deliveredAt: string | Date;
  orderItems: Array<{
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }>;
};

export function OrdersContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      const result = await getUserOrders();
      if (result && "error" in result) {
        toast.error(result.error);
      } else if (result && "orders" in result) {
        const parsedOrders: Order[] = (result.orders || []).map((o: any) => ({
          ...o,
          createdAt: new Date(o.createdAt),
        }));
        setOrders(parsedOrders);
      }
      setIsLoading(false);
    };
    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderItems.some((item) =>
        item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <p className="text-neutral-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-spice-brown mb-2">
            My Orders
          </h1>
          <p className="text-neutral-600">Track and manage your spice orders</p>
        </div>

        {/* Search */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search orders by ID or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-spice-brown">
                        {order.orderNumber}
                      </h3>
                      <Badge className={statusBadge(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </Badge>
                    </div>

                    <div className="text-sm text-neutral-600">
                      <p>Order Date: {fmtDate(order.createdAt)}</p>
                      <p>Total: {fmtNGN(order.totalAmount)}</p>
                      {order.trackingNumber && (
                        <p>Tracking: {order.trackingNumber}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      {order.orderItems.map((item, index) => (
                        <p key={index} className="text-sm text-neutral-700">
                          {item.quantity}x {item.product.name}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="bg-transparent">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `/api/orders/${order.orderNumber}/receipt`,
                          "_blank"
                        )
                      }
                      className="bg-transparent">
                      <DownloadIcon className="h-4 w-4 mr-1" />
                      Download reciept
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && !isLoading && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-neutral-700 mb-2">
                {searchTerm ? "No orders found" : "No orders yet"}
              </h3>
              <p className="text-neutral-600 mb-4">
                {searchTerm
                  ? "Try a different search term"
                  : "Start shopping to see your orders here"}
              </p>
              <Button
                className="bg-spice-orange hover:bg-spice-orange/90"
                asChild>
                <a href="/products">Browse Products</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Order Tracking Modal */}
      {selectedOrder && (
        <OrderTrackingModal
          order={{
            id: selectedOrder.id,
            status: selectedOrder.status as any,
            trackingNumber: selectedOrder.trackingNumber || "",
            createdAt: selectedOrder.createdAt,
            shippedAt: selectedOrder.shippedAt,
            deliveredAt: selectedOrder.deliveredAt,
            items: selectedOrder.orderItems.map((oi) => ({
              name: oi.product.name ?? oi.product?.name ?? "Product",
              quantity: oi.quantity,
              price: Number(oi.price),
            })),
          }}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
