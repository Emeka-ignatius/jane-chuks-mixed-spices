"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Eye } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getOrders, updateStatus, updateTracking } from "@/app/actions/orders"

interface OrderItem {
  id: number
  product_name: string
  product_price: number
  quantity: number
  total_price: number
}

interface Order {
  id: number
  order_number: string
  user_name: string
  user_email: string
  status: string
  payment_status: string
  total_amount: number
  shipping_amount: number
  tax_amount: number
  currency: string
  shipping_first_name: string
  shipping_last_name: string
  shipping_address_line_1: string
  shipping_address_line_2?: string
  shipping_city: string
  shipping_state: string
  shipping_postal_code?: string
  shipping_country: string
  shipping_phone: string
  payment_method?: string
  tracking_number?: string
  shipped_at?: string
  delivered_at?: string
  created_at: string
  items: OrderItem[]
}

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [searchTerm, statusFilter, orders])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      const result = await getOrders()
      if (result.error) {
        toast.error(result.error)
        return
      }
      setOrders(result.data || [])
    } catch (error) {
      toast.error("Failed to load orders")
    } finally {
      setIsLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredOrders(filtered)
  }

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      const result = await updateStatus(orderId, newStatus)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Order status updated successfully")
      loadOrders()
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (error) {
      toast.error("Failed to update order status")
    }
  }

  const handleTrackingUpdate = async (orderId: number, trackingNumber: string) => {
    try {
      const result = await updateTracking(orderId, trackingNumber)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success("Tracking number updated successfully")
      loadOrders()
    } catch (error) {
      toast.error("Failed to update tracking number")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: "default" | "secondary" | "destructive" | "outline"; className: string }
    > = {
      pending: { variant: "secondary", className: "bg-gray-100 text-gray-800" },
      processing: { variant: "default", className: "bg-blue-100 text-blue-800" },
      shipped: { variant: "default", className: "bg-purple-100 text-purple-800" },
      delivered: { variant: "default", className: "bg-green-100 text-green-800" },
      cancelled: { variant: "destructive", className: "bg-red-100 text-red-800" },
      refunded: { variant: "secondary", className: "bg-orange-100 text-orange-800" },
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string }> = {
      pending: { className: "bg-yellow-100 text-yellow-800" },
      paid: { className: "bg-green-100 text-green-800" },
      failed: { className: "bg-red-100 text-red-800" },
      refunded: { className: "bg-orange-100 text-orange-800" },
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <Badge variant="outline" className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatCurrency = (amount: number, currency = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spice-orange mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-spice-brown">Orders</h1>
          <p className="text-neutral-600 mt-1">Manage customer orders and shipments</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
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
                className="pl-10"
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
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">Order Number</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">Customer</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">Total</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">Payment</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-neutral-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-spice-brown">{order.order_number}</div>
                        {order.tracking_number && (
                          <div className="text-xs text-neutral-500 mt-1">Track: {order.tracking_number}</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium">{order.user_name || "Guest"}</div>
                        <div className="text-sm text-neutral-500">{order.user_email}</div>
                      </td>
                      <td className="py-4 px-6 text-sm text-neutral-600">
                        {format(new Date(order.created_at), "MMM dd, yyyy")}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-spice-orange">
                          {formatCurrency(Number(order.total_amount), order.currency)}
                        </div>
                      </td>
                      <td className="py-4 px-6">{getPaymentStatusBadge(order.payment_status)}</td>
                      <td className="py-4 px-6">{getStatusBadge(order.status)}</td>
                      <td className="py-4 px-6">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order)
                            setIsDetailsOpen(true)
                          }}
                        >
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
            <DialogTitle className="text-2xl text-spice-brown">Order Details</DialogTitle>
            <DialogDescription>View and manage order information</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 mt-4">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Order Number</p>
                  <p className="font-semibold text-spice-brown">{selectedOrder.order_number}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Order Date</p>
                  <p className="font-medium">{format(new Date(selectedOrder.created_at), "PPP")}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Customer</p>
                  <p className="font-medium">{selectedOrder.user_name || "Guest"}</p>
                  <p className="text-sm text-neutral-500">{selectedOrder.user_email}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Payment Method</p>
                  <p className="font-medium">{selectedOrder.payment_method || "N/A"}</p>
                </div>
              </div>

              {/* Status Management */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-spice-brown mb-3">Order Status</h3>
                <div className="flex items-center gap-4">
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => handleStatusChange(selectedOrder.id, value)}
                  >
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
                <h3 className="font-semibold text-spice-brown mb-3">Tracking Information</h3>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter tracking number"
                    defaultValue={selectedOrder.tracking_number || ""}
                    onBlur={(e) => {
                      if (e.target.value !== selectedOrder.tracking_number) {
                        handleTrackingUpdate(selectedOrder.id, e.target.value)
                      }
                    }}
                  />
                </div>
              </div>

              {/* Shipping Address */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-spice-brown mb-3">Shipping Address</h3>
                <div className="bg-neutral-50 p-4 rounded-lg space-y-1">
                  <p className="font-medium">
                    {selectedOrder.shipping_first_name} {selectedOrder.shipping_last_name}
                  </p>
                  <p className="text-sm">{selectedOrder.shipping_address_line_1}</p>
                  {selectedOrder.shipping_address_line_2 && (
                    <p className="text-sm">{selectedOrder.shipping_address_line_2}</p>
                  )}
                  <p className="text-sm">
                    {selectedOrder.shipping_city}, {selectedOrder.shipping_state} {selectedOrder.shipping_postal_code}
                  </p>
                  <p className="text-sm">{selectedOrder.shipping_country}</p>
                  <p className="text-sm font-medium mt-2">{selectedOrder.shipping_phone}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-spice-brown mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-neutral-50 p-3 rounded-lg">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-neutral-600">
                          Quantity: {item.quantity} ×{" "}
                          {formatCurrency(Number(item.product_price), selectedOrder.currency)}
                        </p>
                      </div>
                      <p className="font-semibold text-spice-orange">
                        {formatCurrency(Number(item.total_price), selectedOrder.currency)}
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
                    <span className="font-medium">
                      {formatCurrency(
                        Number(selectedOrder.total_amount) -
                          Number(selectedOrder.shipping_amount) -
                          Number(selectedOrder.tax_amount),
                        selectedOrder.currency,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Shipping</span>
                    <span className="font-medium">
                      {formatCurrency(Number(selectedOrder.shipping_amount), selectedOrder.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600">Tax</span>
                    <span className="font-medium">
                      {formatCurrency(Number(selectedOrder.tax_amount), selectedOrder.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span className="text-spice-brown">Total</span>
                    <span className="text-spice-orange">
                      {formatCurrency(Number(selectedOrder.total_amount), selectedOrder.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
