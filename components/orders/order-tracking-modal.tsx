"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { OrderTrackingModalProps } from "@/lib/types";
import { addDays, fmtDate, fmtNGN } from "@/lib/utils";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

const trackingSteps = [
  { id: "ordered", label: "Order Placed", icon: Package },
  { id: "processing", label: "Processing", icon: Clock },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: MapPin },
];

const statusToIndex: Record<OrderStatus, number> = {
  pending: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
  cancelled: 0,
  refunded: 0,
};

export function OrderTrackingModal({
  order,
  isOpen,
  onClose,
}: OrderTrackingModalProps) {
  const curIdx = statusToIndex[order.status as keyof typeof statusToIndex] ?? 0;

  const eta =
    order.deliveredAt ??
    addDays(order.shippedAt ?? order.createdAt, order.shippedAt ? 3 : 5);

  const isTerminal =
    order.status === "cancelled" || order.status === "refunded";

  const statusBadge = (() => {
    switch (order.status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-neutral-200 text-neutral-700";
      default:
        return "bg-neutral-100 text-neutral-700";
    }
  })();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-spice-brown">Order Tracking</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-neutral-700">Order ID</p>
                <p className="text-chart-5">{order.id}</p>
              </div>
              <div>
                <p className="font-medium text-neutral-700">Tracking Number</p>
                <p className="text-chart-5">{order.trackingNumber || "-"}</p>
              </div>
              <div>
                <p className="font-medium text-neutral-700">Status</p>
                <Badge className={statusBadge}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="font-medium text-neutral-700">
                  {order.deliveredAt ? "Delivered On" : "Estimated Delivery"}
                </p>
                <p className="text-chart-5">{fmtDate(eta)}</p>
              </div>
            </div>
          </div>

          {/* Tracking Steps */}
          {!isTerminal ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-chart-2">Tracking Progress</h3>
              <div className="space-y-4">
                {trackingSteps.map((step, index) => {
                  const isCompleted = index <= curIdx;
                  const isCurrent = index === curIdx;
                  const StepIcon = step.icon;
                  return (
                    <div key={step.id} className="flex items-center gap-4">
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-chart-2 text-white"
                            : "bg-neutral-200 text-neutral-400"
                        }`}>
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${
                            isCompleted ? "text-chart-2" : "text-neutral-400"
                          }`}>
                          {step.label}
                        </p>
                        {isCurrent && !order.deliveredAt && (
                          <p className="text-sm text-primary">Current Status</p>
                        )}
                      </div>
                      {index < trackingSteps.length - 1 && (
                        <div
                          className={`w-px h-8 ${
                            isCompleted ? "bg-foreground" : "bg-neutral-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-md bg-neutral-50">
              {order.status === "cancelled" ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <RotateCcw className="h-5 w-5 text-neutral-600" />
              )}
              <p className="text-sm text-neutral-700">
                This order is{" "}
                <span className="font-medium">{order.status}</span>.
              </p>
            </div>
          )}

          {/* Order Items */}
          <div className="space-y-3">
            <h3 className="font-semibold text-spice-brown">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-neutral-100 last:border-0">
                  <div>
                    <p className="font-medium text-neutral-700">{item.name}</p>
                    <p className="text-sm text-neutral-600">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-spice-orange">
                    {fmtNGN(item.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
