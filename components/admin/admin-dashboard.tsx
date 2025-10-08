"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getAdminStats } from "@/app/actions/admin";
import { toast } from "sonner";

interface StatsData {
  totalUsers: number;
  productsSold: number;
  activeOrders: number;
  revenue: number;
  recentOrders: Array<{
    id: string;
    customer: string;
    product: string;
    amount: number;
    status: string;
  }>;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const result = await getAdminStats();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setStats(result.data!);
    } catch (error) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spice-orange mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-neutral-600">No data available</p>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Products Sold",
      value: stats.productsSold.toString(),
      change: "+8%",
      trend: "up",
      icon: Package,
      color: "text-spice-green",
    },
    {
      title: "Active Orders",
      value: stats.activeOrders.toString(),
      change: "-3%",
      trend: "down",
      icon: ShoppingCart,
      color: "text-spice-orange",
    },
    {
      title: "Revenue",
      value: `₦${stats.revenue.toLocaleString()}`,
      change: "+15%",
      trend: "up",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <Card
            key={stat.title}
            className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-spice-brown mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-medium ml-1 ${
                        stat.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-full bg-neutral-100 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-spice-brown">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-medium text-neutral-600">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-600">
                    Customer
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-600">
                    Product
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-600">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-neutral-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-neutral-500">
                      No recent orders
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4 font-medium text-spice-brown">
                        {order.id}
                      </td>
                      <td className="py-3 px-4">{order.customer}</td>
                      <td className="py-3 px-4">{order.product}</td>
                      <td className="py-3 px-4 font-medium">
                        ₦{order.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "processing"
                              ? "bg-yellow-100 text-yellow-800"
                              : order.status === "shipped"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
