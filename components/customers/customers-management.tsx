"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Calendar,
} from "lucide-react";
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
import { getCustomers, getCustomerDetails } from "@/app/actions/customers";
import { fmtNGN } from "@/lib/utils";

interface Customer {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  lastOrderDate: string | null;
  status: string;
}

interface CustomerDetails extends Customer {
  addresses: Array<{
    id: string;
    type: string;
    firstName: string | null;
    lastName: string | null;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    postalCode?: string | null;
    country: string;
    phone: string | null;
    isDefault: boolean;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

export function CustomersManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, statusFilter, customers]);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const result = await getCustomers();
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setCustomers(result.data ?? []);
    } catch (error) {
      toast.error("Failed to load customers");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerDetails = async (customerId: string) => {
    try {
      setIsLoadingDetails(true);
      const result = await getCustomerDetails(customerId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      // ensure undefined is converted to null to match the state type CustomerDetails | null
      setSelectedCustomer(result.data ?? null);
      setIsDetailsOpen(true);
    } catch (error) {
      toast.error("Failed to load customer details");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (customer) => customer.status === statusFilter
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { className: string }> = {
      active: { className: "bg-green-100 text-green-800" },
      inactive: { className: "bg-gray-100 text-gray-800" },
      new: { className: "bg-blue-100 text-blue-800" },
    };

    const config = statusConfig[status] || statusConfig.inactive;
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
            <div className="h-6 w-40 bg-neutral-200 rounded" />
            <div className="h-4 w-64 bg-neutral-200 rounded" />
          </div>
          <div className="h-8 w-36 bg-neutral-200 rounded" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="border border-neutral-200 rounded-xl shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-neutral-200 rounded" />
                  <div className="h-6 w-16 bg-neutral-300 rounded" />
                </div>
                <div className="h-10 w-10 bg-neutral-200 rounded-full" />
              </div>
            </div>
          ))}
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

        {/* Customers Table Skeleton */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50">
                    {[
                      "Customer",
                      "Contact",
                      "Orders",
                      "Total Spent",
                      "Join Date",
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
          <h1 className="text-3xl font-bold text-spice-brown">Customers</h1>
          <p className="text-neutral-600 mt-1">
            Manage customer accounts and information
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            {customers.length} Total Customers
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Customers</p>
                <p className="text-2xl font-bold text-spice-brown">
                  {customers.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Active Customers</p>
                <p className="text-2xl font-bold text-spice-brown">
                  {customers.filter((c) => c.status === "active").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">New This Month</p>
                <p className="text-2xl font-bold text-spice-brown">
                  {
                    customers.filter((c) => {
                      const joinDate = new Date(c.joinDate);
                      const now = new Date();
                      return (
                        joinDate.getMonth() === now.getMonth() &&
                        joinDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total Revenue</p>
                <p className="text-2xl font-bold text-spice-orange">
                  {fmtNGN(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or phone..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">
                    Customer
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">
                    Contact
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">
                    Orders
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">
                    Total Spent
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm">
                    Join Date
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
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-12 text-neutral-500">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-spice-brown">
                          {customer.name || "N/A"}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {customer.email}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-sm text-neutral-600">
                          <Phone className="h-4 w-4" />
                          {customer.phone || "N/A"}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-spice-brown">
                          {customer.totalOrders}
                        </div>
                        {customer.lastOrderDate && (
                          <div className="text-xs text-neutral-500">
                            Last:{" "}
                            {format(
                              new Date(customer.lastOrderDate),
                              "MMM dd, yyyy"
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-spice-orange">
                          {fmtNGN(customer.totalSpent)}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-neutral-600">
                        {format(new Date(customer.joinDate), "MMM dd, yyyy")}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(customer.status)}
                      </td>
                      <td className="py-4 px-6">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => loadCustomerDetails(customer.id)}
                          disabled={isLoadingDetails}>
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

      {/* Customer Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-spice-brown">
              Customer Details
            </DialogTitle>
            <DialogDescription>
              View customer information and order history
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6 mt-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Name</p>
                  <p className="font-semibold text-spice-brown">
                    {selectedCustomer.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Status</p>
                  {getStatusBadge(selectedCustomer.status)}
                </div>
                <div>
                  <p className="text-sm text-neutral-600 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-medium">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Phone
                  </p>
                  <p className="font-medium">
                    {selectedCustomer.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Join Date</p>
                  <p className="font-medium">
                    {format(new Date(selectedCustomer.joinDate), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Last Order</p>
                  <p className="font-medium">
                    {selectedCustomer.lastOrderDate
                      ? format(new Date(selectedCustomer.lastOrderDate), "PPP")
                      : "No orders yet"}
                  </p>
                </div>
              </div>

              {/* Order Stats */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-spice-brown mb-3">
                  Order Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-0 bg-neutral-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-neutral-600">Total Orders</p>
                      <p className="text-2xl font-bold text-spice-brown">
                        {selectedCustomer.totalOrders}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-0 bg-neutral-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-neutral-600">Total Spent</p>
                      <p className="text-2xl font-bold text-spice-orange">
                        {fmtNGN(selectedCustomer.totalSpent)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Addresses */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-spice-brown mb-3 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Addresses
                </h3>
                {selectedCustomer.addresses.length === 0 ? (
                  <p className="text-neutral-500 text-sm">No addresses saved</p>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomer.addresses.map((address) => (
                      <div
                        key={address.id}
                        className="bg-neutral-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {address.type}
                          </Badge>
                          {address.isDefault && (
                            <Badge
                              variant="default"
                              className="text-xs bg-spice-orange">
                              Default
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium">
                          {address.firstName} {address.lastName}
                        </p>
                        <p className="text-sm">{address.addressLine1}</p>
                        {address.addressLine2 && (
                          <p className="text-sm">{address.addressLine2}</p>
                        )}
                        <p className="text-sm">
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p className="text-sm">{address.country}</p>
                        <p className="text-sm font-medium mt-2">
                          {address.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Orders */}
              <div className="border-t pt-4">
                <h3 className="font-semibold text-spice-brown mb-3">
                  Recent Orders
                </h3>
                {selectedCustomer.recentOrders.length === 0 ? (
                  <p className="text-neutral-500 text-sm">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomer.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex justify-between items-center bg-neutral-50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium text-spice-brown">
                            {order.orderNumber}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {format(new Date(order.createdAt), "PPP")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-spice-orange">
                            {fmtNGN(order.totalAmount)}
                          </p>
                          <Badge variant="outline" className="text-xs mt-1">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
