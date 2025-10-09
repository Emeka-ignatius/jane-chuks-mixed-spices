"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Eye } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAdminOrders,
  updateAdminOrderStatus,
  updateAdminTracking,
} from "@/app/actions/admin";
import { fmtNGN } from "@/lib/utils";

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  user_name: string;
  user_email: string;
  status: string;
  payment_status: string;
  total_amount: number;
  shipping_amount: number;
  tax_amount: number;
  currency: string;
  shipping_first_name: string;
  shipping_last_name: string;
  shipping_address_line_1: string;
  shipping_address_line_2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code?: string;
  shipping_country: string;
  shipping_phone: string;
  payment_method?: string;
  tracking_number?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  items: OrderItem[];
}

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, orders]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const result = await getAdminOrders();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const data = result.data ?? [];
      if (Array.isArray(data)) {
        const normalized = data.map((o: any) => ({
          ...o,
          id: typeof o.id === "string" ? String(o.id) : o.id,
          items: Array.isArray(o.items)
            ? o.items.map((it: any) => ({
                ...it,
                id: typeof it.id === "string" ? String(it.id) : it.id,
                product_price:
                  typeof it.product_price === "string"
                    ? Number(it.product_price)
                    : it.product_price,
                total_price:
                  typeof it.total_price === "string"
                    ? Number(it.total_price)
                    : it.total_price,
                quantity:
                  typeof it.quantity === "string"
                    ? Number(it.quantity)
                    : it.quantity,
              }))
            : [],
        })) as Order[];
        setOrders(normalized);
      } else {
        setOrders([]);
      }
    } catch (error) {
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const result = await updateAdminOrderStatus({
        id: String(orderId),
        status: newStatus,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Order status updated successfully");
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleTrackingUpdate = async (
    orderId: string | number,
    trackingNumber: string
  ) => {
    try {
      const result = await updateAdminTracking({
        id: String(orderId),
        trackingNumber,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Tracking number updated successfully");
      loadOrders();
    } catch (error) {
      toast.error("Failed to update tracking number");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        className: string;
      }
    > = {
      pending: { variant: "secondary", className: "bg-gray-100 text-gray-800" },
      processing: {
        variant: "default",
        className: "bg-blue-100 text-blue-800",
      },
      shipped: {
        variant: "default",
        className: "bg-purple-100 text-purple-800",
      },
      delivered: {
        variant: "default",
        className: "bg-green-100 text-green-800",
      },
      cancelled: {
        variant: "destructive",
        className: "bg-red-100 text-red-800",
      },
      refunded: {
        variant: "secondary",
        className: "bg-orange-100 text-orange-800",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string }> = {
      pending: { className: "bg-yellow-100 text-yellow-800" },
      paid: { className: "bg-green-100 text-green-800" },
      failed: { className: "bg-red-100 text-red-800" },
      refunded: { className: "bg-orange-100 text-orange-800" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant="outline" className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-6 w-32 bg-neutral-200 rounded" />
            <div className="h-4 w-48 bg-neutral-200 rounded" />
          </div>
          <div className="h-8 w-32 bg-neutral-200 rounded" />
        </div>

        {/* Filters Skeleton */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="h-10 bg-neutral-200 rounded flex-1" />
              <div className="h-10 w-full sm:w-[180px] bg-neutral-200 rounded" />
            </div>
          </CardContent>
        </Card>

        {/* Orders Table Skeleton */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    {[
                      "Order Number",
                      "Customer",
                      "Date",
                      "Total",
                      "Payment",
                      "Status",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr
                      key={i}
                      className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      {Array(7)
                        .fill(0)
                        .map((_, j) => (
                          <td key={j} className="py-4 px-6">
                            <div className="h-4 w-24 bg-neutral-200 rounded" />
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="md:text-3xl text-xl font-bold text-spice-brown">
            Orders
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage customer orders and shipments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="md:text-lg text-md px-4 py-2">
            {orders.length} Total Orders
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search by order number, customer name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-md"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">
                    Order Number
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">
                    Customer
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">
                    Total
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">
                    Payment
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-neutral-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="md:font-medium font-normal text-primary">
                          {order.order_number}
                        </div>
                        {order.tracking_number && (
                          <div className="text-xs text-neutral-500 mt-1">
                            Track: {order.tracking_number}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="md:font-medium font-normal">
                          {order.user_name || "Guest"}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {order.user_email}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-neutral-600">
                        {format(new Date(order.created_at), "MMM dd, yyyy")}
                      </td>
                      <td className="py-4 px-6">
                        <div className="md:font-medium font-normal text-primary/70">
                          {fmtNGN(order.total_amount)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getPaymentStatusBadge(order.payment_status)}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-4 px-6">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailsOpen(true);
                          }}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">
              Order Details
            </DialogTitle>
            <DialogDescription>
              View and manage order information
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Order Number</p>
                  <p className="font-semibold text-primary">
                    {selectedOrder.order_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Order Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedOrder.created_at), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Customer</p>
                  <p className="font-medium">
                    {selectedOrder.user_name || "Guest"}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {selectedOrder.user_email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Payment Method</p>
                  <p className="font-medium">
                    {selectedOrder.payment_method || "N/A"}
                  </p>
                </div>
              </div>

              {/* Status Management */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-primary mb-3">
                  Order Status
                </h3>
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) =>
                      handleStatusChange(selectedOrder.id, value)
                    }>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  {getStatusBadge(selectedOrder.status)}
                  {getPaymentStatusBadge(selectedOrder.payment_status)}
                </div>
              </div>

              {/* Tracking Number */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-spice-brown mb-3">
                  Tracking Information
                </h3>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter tracking number"
                    defaultValue={selectedOrder.tracking_number || ""}
                    onBlur={(e) => {
                      if (e.target.value !== selectedOrder.tracking_number) {
                        handleTrackingUpdate(selectedOrder.id, e.target.value);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-primary mb-3">
                  Shipping Address
                </h3>
                <div className="bg-neutral-50 p-4 rounded-lg space-y-1">
                  <p className="md:font-medium font-normal">
                    {selectedOrder.shipping_first_name}{" "}
                    {selectedOrder.shipping_last_name}
                  </p>
                  <p className="text-sm">
                    {selectedOrder.shipping_address_line_1}
                  </p>
                  {selectedOrder.shipping_address_line_2 && (
                    <p className="text-sm">
                      {selectedOrder.shipping_address_line_2}
                    </p>
                  )}
                  <p className="text-sm">
                    {selectedOrder.shipping_city},{" "}
                    {selectedOrder.shipping_state}{" "}
                    {selectedOrder.shipping_postal_code}
                  </p>
                  <p className="text-sm">{selectedOrder.shipping_country}</p>
                  <p className="text-sm md:font-medium font-normal mt-2">
                    {selectedOrder.shipping_phone}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-spice-brown mb-3">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-neutral-50 p-3 rounded-lg">
                      <div>
                        <p className="md:font-medium font-normal">
                          {item.product_name}
                        </p>
                        <p className="text-sm text-neutral-600">
                          Quantity: {item.quantity} ×{" "}
                          {fmtNGN(Number(item.product_price))}
                        </p>
                      </div>
                      <p className="font-semibold text-spice-orange">
                        {fmtNGN(Number(item.total_price))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Subtotal</span>
                    <span className="md:font-medium font-normal">
                      {fmtNGN(
                        Number(selectedOrder.total_amount) -
                          Number(selectedOrder.shipping_amount) -
                          Number(selectedOrder.tax_amount)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Shipping</span>
                    <span className="md:font-medium font-normal">
                      {fmtNGN(Number(selectedOrder.shipping_amount))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Tax</span>
                    <span className="md:font-medium font-normal">
                      {fmtNGN(Number(selectedOrder.tax_amount))}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span className="text-primary">Total</span>
                    <span className="text-primary">
                      {fmtNGN(Number(selectedOrder.total_amount))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
