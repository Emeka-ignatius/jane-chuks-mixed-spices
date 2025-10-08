"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Plus, Edit, Trash2, Home, Building } from "lucide-react";
import { toast } from "sonner";
import { IAddress } from "@/lib/types";
import { NigerianStates } from "../checkout/checkout-form";

type AddressTypeUI = "home" | "office";

const mapFromDB = (row: any): IAddress => ({
  id: row.id,
  type: row.type === "billing" ? "office" : "home",
  isDefault: row.isDefault,
  firstName: row.firstName ?? "",
  lastName: row.lastName ?? "",
  phone: row.phone ?? "",
  address: row.address,
  addressLine2: row.addressLine2 ?? "",
  city: row.city,
  state: row.state,
  postalCode: row.postalCode ?? "",
  country: row.country ?? "Nigeria",
});

export function AddressManagement() {
  const [addresses, setAddresses] = useState<IAddress[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<IAddress | null>(null);

  async function load() {
    const res = await fetch("/api/addresses", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setAddresses(data.map(mapFromDB));
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleSetDefault = async (addressId: string) => {
    const res = await fetch(`/api/addresses/${addressId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true }),
    });
    if (res.ok) {
      toast.success("Default address updated");
      load();
    } else {
      toast.error("Failed to set default");
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    const res = await fetch(`/api/addresses/${addressId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Address deleted");
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    } else {
      toast.error("Failed to delete address");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-spice-brown">
            Saved Addresses
          </h3>
          <p className="text-sm text-neutral-600">
            Manage your shipping and billing addresses
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className=" hover:bg-spice-orange/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <AddressForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-700 mb-2">
              No addresses saved 📍
            </h3>
            <p className="text-neutral-600 mb-4">
              Add your addresses to make checkout faster and easier.
            </p>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className=" hover:bg-spice-orange/90">
              <MapPin className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {address.type === "home" ? (
                      <Home className="h-4 w-4 text-spice-orange" />
                    ) : (
                      <Building className="h-4 w-4 text-spice-orange" />
                    )}
                    <span className="font-medium text-spice-brown capitalize">
                      {address.type}
                    </span>
                    {address.isDefault && (
                      <Badge className="bg-spice-green text-white">
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingAddress(address)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-medium text-spice-brown">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-neutral-600">{address.phone}</p>
                  <p className="text-neutral-600">{address.address}</p>
                  <p className="text-neutral-600">
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                </div>

                {!address.isDefault && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSetDefault(address.id)}
                    className="mt-4 w-full bg-transparent">
                    Set as Default
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Address Dialog */}
      {editingAddress && (
        <Dialog
          open={!!editingAddress}
          onOpenChange={() => setEditingAddress(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Address</DialogTitle>
            </DialogHeader>
            <AddressForm
              address={editingAddress}
              onClose={() => setEditingAddress(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function AddressForm({
  address,
  onClose,
}: {
  address?: IAddress;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [stateVal, setStateVal] = useState(address?.state ?? "");
  const [typeVal, setTypeVal] = useState<AddressTypeUI>(
    address?.type ?? "home"
  );
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      firstName: String(fd.get("firstName") || ""),
      lastName: String(fd.get("lastName") || ""),
      phone: String(fd.get("phone") || ""),
      address: String(fd.get("address") || ""),
      addressLine2: String(fd.get("addressLine2") || ""),
      city: String(fd.get("city") || ""),
      state: String(fd.get("state") || ""),
      postalCode: String(fd.get("postalCode") || ""),
      country: "Nigeria",
      type: (fd.get("type") as AddressTypeUI) || "home", // "home" | "office"
      isDefault: String(fd.get("isDefault")) === "true",
    };

    const res = await fetch(
      address ? `/api/addresses/${address.id}` : "/api/addresses",
      {
        method: address ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    setIsLoading(false);
    if (!res.ok) return toast.error("Something went wrong");

    toast.success(address ? "Address updated" : "Address added");
    onClose();
    // A small convenience: reload after close if you lifted `load` via props,
    // or trigger a custom event the parent listens to.
    window.dispatchEvent(new CustomEvent("addresses:refresh"));
  }

  useEffect(() => {
    const onRefresh = () =>
      (document as any).activeElement?.dispatchEvent(new Event("blur"));
    window.addEventListener("addresses:refresh", onRefresh);
    return () => window.removeEventListener("addresses:refresh", onRefresh);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={address?.firstName}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={address?.lastName}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={address?.phone}
          required
        />
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          defaultValue={address?.address}
          required
        />
      </div>

      <div>
        <Label htmlFor="addressLine2">Address Line 2 (optional)</Label>
        <Input
          id="addressLine2"
          name="addressLine2"
          defaultValue={address?.addressLine2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={address?.city} required />
        </div>
        <div>
          <Label>State</Label>
          <Select value={stateVal} onValueChange={setStateVal}>
            <SelectTrigger>
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              {NigerianStates.map((st) => (
                <SelectItem key={st} value={st}>
                  {st}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Mirror shadcn value into form data */}
          <input type="hidden" name="state" value={stateVal} />
        </div>
      </div>

      <div>
        <Label htmlFor="postalCode">Postal Code</Label>
        <Input
          id="postalCode"
          name="postalCode"
          defaultValue={address?.postalCode}
        />
      </div>

      <div>
        <Label>Address Type</Label>
        <Select
          value={typeVal}
          onValueChange={(v) => setTypeVal(v as AddressTypeUI)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="home">Home</SelectItem>
            <SelectItem value="office">Office</SelectItem>
          </SelectContent>
        </Select>
        <input type="hidden" name="type" value={typeVal} />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="isDefault"
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
        />
        <Label htmlFor="isDefault">Set as default</Label>
        <input type="hidden" name="isDefault" value={isDefault ? "true" : ""} />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 bg-transparent">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 hover:bg-spice-orange/90">
          {isLoading ? "Saving..." : address ? "Update" : "Add"} Address
        </Button>
      </div>
    </form>
  );
}
