"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Package,
  MapPin,
  LogOut,
  Edit,
  ShoppingBag,
  ChevronRight,
  Download,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import type { AuthUser } from "@/lib/auth";
import { toast } from "sonner";
import { getRecentOrders, getUserStats } from "@/app/actions/orders";
import { fmtNGN, statusBadge } from "@/lib/utils";
import Link from "next/link";
import { AddressManagement } from "./address-management";

interface ProfileContentProps {
  user: AuthUser;
}

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  productPrice: number;
  totalPrice: number;
};

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string; // e.g. "pending" | "processing" | "shipped" | "delivered" | "canceled"
  totalAmount: number;
  createdAt: string;
  paymentStatus?: string; // "paid" etc.
  orderItems: OrderItem[];
};

export function ProfileContent({ user }: ProfileContentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ totalOrders: 0, totalSpent: 0 });
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const result = await getUserStats();
      if (!result.error) {
        setStats({
          totalOrders: result.totalOrders || 0,
          totalSpent: result.totalSpent || 0,
        });
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingOrders(true);
      const res = await getRecentOrders(5);
      if (Array.isArray(res)) {
        setOrders(
          res.map((r) => ({
            ...r,
            paymentStatus: r.paymentStatus ?? undefined,
          }))
        );
      } else {
        console.error(res.error);
      }
      setLoadingOrders(false);
    })();
  }, []);

  const initials = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user?.name]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logoutAction();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
      setIsLoading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary to-accent text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold gradient-text">
                    {user.name || "User"}
                  </h1>
                  {user.isAdmin && <Badge className="bg-accent">Admin</Badge>}
                </div>
                <p className="text-muted-foreground">{user.email}</p>
                {user.phone && (
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  disabled={isLoading}>
                  <LogOut className="h-4 w-4 mr-2" />
                  {isLoading ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Quick Stats */}
              <Card className="interactive-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Orders
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalOrders === 0
                      ? "No orders yet"
                      : "All time orders"}
                  </p>
                </CardContent>
              </Card>

              <Card className="interactive-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Spent
                  </CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {fmtNGN(stats.totalSpent)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.totalSpent === 0
                      ? "Start shopping!"
                      : "All time spending"}
                  </p>
                </CardContent>
              </Card>

              <Card className="interactive-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Favorite Products
                  </CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">
                    Add some favorites
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest account activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold mb-2">
                    No activity yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start shopping to see your activity here
                  </p>
                  <Button asChild>
                    <a href="/products">Browse Products</a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest purchases</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="py-10 text-center text-muted-foreground">
                    Loading orders…
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-muted-foreground mb-4">
                      You haven't placed any orders yet.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button asChild>
                        <Link href="/products">Start Shopping</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/orders">View All Orders</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y">
                    {orders.map((o) => (
                      <div
                        key={o.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 items-center gap-4">
                        <div className="flex flex-wrap gap-4 sm:flex-nowrap sm:items-center sm:gap-6">
                          <div className="min-w-[120px]">
                            <div className="text-sm text-muted-foreground">
                              Order
                            </div>
                            <div className="font-medium">{o.orderNumber}</div>
                          </div>

                          <div className="hidden sm:block min-w-[150px]">
                            <div className="text-sm text-muted-foreground">
                              Date
                            </div>
                            <div className="font-medium">
                              {new Date(o.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="hidden sm:block min-w-[100px]">
                            <div className="text-sm text-muted-foreground">
                              Items
                            </div>
                            <div className="font-medium">
                              {o.orderItems.length}
                            </div>
                          </div>

                          <div className="min-w-[120px]">
                            <div className="text-sm text-muted-foreground">
                              Total
                            </div>
                            <div className="font-medium">
                              {fmtNGN(Number(o.totalAmount || 0))}
                            </div>
                          </div>

                          <div className="min-w-[110px]">
                            <Badge className={statusBadge(o.status)}>
                              {o.status}
                            </Badge>
                          </div>

                          <div className="mt-3 sm:mt-0 sm:ml-auto flex md:grid gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/orders?focus=${o.orderNumber}`}>
                                View <ChevronRight className="ml-1 h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={`/api/orders/${o.orderNumber}/receipt`}
                                target="_blank"
                                rel="noopener">
                                <Download className="mr-2 h-4 w-4" />
                                Receipt
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View and track your orders</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Redirect them to the dedicated page that already works */}
                <div className="flex items-center justify-between p-4 rounded-md border">
                  <div>
                    <div className="font-medium">Go to Orders</div>
                    <p className="text-sm text-muted-foreground">
                      See tracking, receipts, and more.
                    </p>
                  </div>
                  <Button asChild>
                    <Link href="/orders">
                      Open Orders <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses" className="mt-8">
            <AddressManagement />
            {/* <Card>
              <CardHeader>
                <CardTitle>Saved Addresses</CardTitle>
                <CardDescription>
                  Manage your shipping and billing addresses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📍</div>
                  <h3 className="text-xl font-semibold mb-2">
                    No addresses saved
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Add your addresses to make checkout faster and easier.
                  </p>
                  <Button>
                    <MapPin className="h-4 w-4 mr-2" />
                    Add Address
                  </Button>
                </div>
              </CardContent>
            </Card> */}
          </TabsContent>

          <TabsContent value="settings" className="mt-8">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your orders
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-muted-foreground">
                        Change your account password
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Change
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control your privacy and data preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Export</h4>
                      <p className="text-sm text-muted-foreground">
                        Download your account data
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Delete Account</h4>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete your account
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
