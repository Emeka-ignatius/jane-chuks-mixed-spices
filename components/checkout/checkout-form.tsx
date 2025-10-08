"use client";

import type React from "react";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, User, Phone, MapPin, ArrowRight } from "lucide-react";
import type { AuthUser } from "@/lib/auth";

interface CheckoutFormProps {
  user?: AuthUser | null;
  onNext: () => void;
  onDataChange: (data: any) => void;
}

type SavedAddress = {
  id: string;
  type: "shipping" | "billing";
  isDefault: boolean;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
};

export const NigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const NEW = "__NEW__";

export function CheckoutForm({
  user,
  onNext,
  onDataChange,
}: CheckoutFormProps) {
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string>(NEW);
  const selectedAddr = useMemo<
    ((typeof saved)[number] & { setAsDefault?: boolean }) | null
  >(
    () => saved.find((a) => a.id === selectedAddrId) || null,
    [saved, selectedAddrId]
  );
  const onDataChangeRef = useRef(onDataChange);
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    phone: user?.phone || "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Nigeria",
    saveAddress: false,
    setAsDefault: false,
    specialInstructions: "",
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await fetch("/api/addresses", { cache: "no-store" });
        if (!res.ok) return;
        const rows: SavedAddress[] = await res.json();
        const shippingOnly = rows.filter((r) => r.type === "shipping");
        setSaved(shippingOnly);

        const preferred =
          shippingOnly.find((a) => a.isDefault) || shippingOnly[0];

        if (preferred) {
          setSelectedAddrId(preferred.id);
          setFormData((fd) => ({
            ...fd,
            firstName: preferred.firstName || fd.firstName,
            lastName: preferred.lastName || fd.lastName,
            phone: preferred.phone || fd.phone,
            addressLine1: preferred.addressLine1 || "",
            addressLine2: preferred.addressLine2 || "",
            city: preferred.city || "",
            state: preferred.state || "",
            postalCode: preferred.postalCode || "",
            country: preferred.country || "Nigeria",
          }));
        }
      } catch {
        /* ignore */
      }
    })();
  }, [user]);

  useEffect(() => {
    onDataChangeRef.current({
      ...formData,
      // what the order API currently expects as "shippingAddressLine1":
      shippingAddress: {
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        address: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
      },
      selectedSavedAddressId: selectedAddrId !== NEW ? selectedAddrId : null,
    });
  }, [formData, selectedAddrId]);

  const handleInputChange = (field: string, value: string | boolean) => {
    const next = { ...formData, [field]: value };
    setFormData(next);
  };

  const applySavedToForm = (addr: SavedAddress | null) => {
    if (!addr) return;
    setFormData((fd) => ({
      ...fd,
      firstName: addr.firstName || fd.firstName,
      lastName: addr.lastName || fd.lastName,
      phone: addr.phone || fd.phone,
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "Nigeria",
    }));
  };

  const handleSelectSaved = (value: string) => {
    setSelectedAddrId(value);
    if (value === NEW) return;
    const addr = saved.find((a) => a.id === value) || null;
    if (addr) applySavedToForm(addr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // persist to address book if asked to
    if (user && formData.saveAddress) {
      try {
        await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "home", // server maps home->shipping
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            address: formData.addressLine1,
            addressLine2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            isDefault: !!formData.setAsDefault,
          }),
        });
      } catch {
        // non-blocking—checkout can proceed even if saving fails
      }
    }

    onNext();
  };

  const isFormValid = () => {
    return (
      formData.email &&
      formData.firstName &&
      formData.lastName &&
      formData.phone &&
      formData.addressLine1 &&
      formData.city &&
      formData.state
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Shipping Information</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Saved addresses selector */}
          {user && saved.length > 0 && (
            <div className="space-y-2 w-full max-w-full">
              <Label className="block text-sm font-medium text-neutral-700">
                Use a saved address
              </Label>
              <div className="w-full">
                <Select
                  value={selectedAddrId}
                  onValueChange={handleSelectSaved}>
                  <SelectTrigger className="w-full max-w-md overflow-hidden text-ellipsis whitespace-nowrap">
                    <SelectValue placeholder="Choose an address" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[90vw] sm:max-w-md">
                    <SelectItem value={NEW}>Use a new address</SelectItem>
                    {saved.map((a) => (
                      <SelectItem
                        key={a.id}
                        value={a.id}
                        className="text-sm leading-snug break-words whitespace-normal">
                        {`${a.firstName ?? ""} ${a.lastName ?? ""}`.trim() ||
                          "Name"}{" "}
                        · {a.addressLine1 ?? ""}, {a.city ?? ""} {a.state ?? ""}{" "}
                        {a.isDefault ? "· Default" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    disabled={!!user}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+234 XXX XXX XXXX"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="space-y-4">
            <h3 className="font-semibold">Shipping Address</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="First name"
                    className="pl-10"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                placeholder="Street address, P.O. box, company name"
                value={formData.addressLine1}
                onChange={(e) =>
                  handleInputChange("addressLine1", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
              <Input
                id="addressLine2"
                placeholder="Apartment, suite, unit, building, floor, etc."
                value={formData.addressLine2}
                onChange={(e) =>
                  handleInputChange("addressLine2", e.target.value)
                }
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => handleInputChange("state", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {NigerianStates.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  placeholder="Postal code"
                  value={formData.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="specialInstructions">
              Special Delivery Instructions (Optional)
            </Label>
            <Textarea
              id="specialInstructions"
              placeholder="Any special instructions for delivery..."
              value={formData.specialInstructions}
              onChange={(e) =>
                handleInputChange("specialInstructions", e.target.value)
              }
              rows={3}
            />
          </div>

          {/* Save Address */}
          {user && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saveAddress"
                  checked={formData.saveAddress}
                  onCheckedChange={(checked) =>
                    handleInputChange("saveAddress", Boolean(checked))
                  }
                />
                <Label htmlFor="saveAddress" className="text-sm cursor-pointer">
                  Save this address for future orders
                </Label>
              </div>

              {formData.saveAddress && (
                <div className="flex items-center space-x-2 pl-6">
                  <Checkbox
                    id="setAsDefault"
                    checked={formData.setAsDefault}
                    onCheckedChange={(checked) =>
                      handleInputChange("setAsDefault", Boolean(checked))
                    }
                  />
                  <Label
                    htmlFor="setAsDefault"
                    className="text-sm cursor-pointer">
                    Set as my default shipping address
                  </Label>
                </div>
              )}
            </div>
          )}

          {/* Continue */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!isFormValid()}>
            Continue to Payment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
