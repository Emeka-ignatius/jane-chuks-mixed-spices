"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react";
import { toast } from "sonner";
import { fmtNGN } from "@/lib/utils";
import { getAdminProducts } from "@/app/actions/admin";
import { deleteAdminProduct } from "@/app/actions/procust";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string; // "Active" | "Low Stock" | "Archived" (etc)
  image: string | null;
  sold: number;
};

const useDebounced = (value: string, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

export function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sort, setSort] = useState<"new" | "price-asc" | "price-desc">("new");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebounced(searchTerm);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const result = await getAdminProducts();
        if (result.error) {
          toast.error(result.error);
          setProducts([]);
          return;
        }
        setProducts(result.data || []);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let out = products;

    // search
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      out = out.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    // category
    if (category !== "all") {
      out = out.filter((p) => p.category.toLowerCase() === category);
    }
    // status
    if (status !== "all") {
      out = out.filter((p) => p.status.toLowerCase() === status);
    }
    // sort
    out = [...out];
    if (sort === "price-asc") out.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") out.sort((a, b) => b.price - a.price);
    // "new" just leaves server order (by createdAt desc) as returned by action
    return out;
  }, [products, debouncedSearch, category, status, sort]);

  const handleDelete = (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    startTransition(() => {
      (async () => {
        const res = await deleteAdminProduct(id);
        if (res?.error) {
          toast.error(res.error);
          return;
        }
        toast.success("Product deleted");
        setProducts((prev) => prev.filter((p) => p.id !== id));
      })();
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 rounded-lg bg-neutral-200" />
                  <div className="w-16 h-6 rounded bg-neutral-200" />
                </div>
                <div className="h-5 w-3/4 bg-neutral-200 rounded" />
                <div className="h-4 w-1/2 bg-neutral-200 rounded" />
                <div className="h-4 w-2/3 bg-neutral-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-spice-brown">Products</h1>
          <p className="text-neutral-600 mt-1">Manage your spice products</p>
        </div>
        <Button className="bg-spice-orange hover:bg-spice-orange/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="md:flex grid gap-2">
              <Button
                type="button"
                variant={category !== "all" ? "default" : "outline"}
                onClick={() =>
                  setCategory((c) => (c === "all" ? "women" : "all"))
                }>
                <Filter className="h-4 w-4 mr-2" />
                {category === "all" ? "Category: All" : `Category: Women`}
              </Button>
              <Button
                type="button"
                variant={status !== "all" ? "default" : "outline"}
                onClick={() =>
                  setStatus((s) => (s === "all" ? "active" : "all"))
                }>
                {status === "all" ? "Status: All" : "Status: Active"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setSort((s) =>
                    s === "new"
                      ? "price-asc"
                      : s === "price-asc"
                      ? "price-desc"
                      : "new"
                  )
                }>
                Sort:{" "}
                {sort === "new"
                  ? "New"
                  : sort === "price-asc"
                  ? "Price ↑"
                  : "Price ↓"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-neutral-500">
            No products found
          </div>
        ) : (
          filtered.map((product) => (
            <Card
              key={product.id}
              className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100">
                    <Image
                      src={product.image || "/images/placeholder.png"}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                      onError={(e) => {
                        // @ts-ignore - Next/Image type
                        e.currentTarget.src = "/images/placeholder.png";
                      }}
                    />
                  </div>
                  <Badge
                    variant={
                      product.status === "Active" ? "default" : "secondary"
                    }
                    className={
                      product.status === "Active"
                        ? "bg-spice-green text-white"
                        : "bg-neutral-200 text-neutral-700"
                    }>
                    {product.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-spice-brown line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {product.category}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-spice-orange">
                      {fmtNGN(product.price)}
                    </span>
                    <span className="text-sm text-neutral-600">
                      {product.stock} in stock
                    </span>
                  </div>

                  <div className="text-sm text-neutral-600">
                    <span className="font-medium">{product.sold}</span> sold
                  </div>

                  <div className="flex gap-2 pt-2">
                    {/* <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 bg-transparent">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button> */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 bg-transparent"
                      disabled={isPending}
                      onClick={() => handleDelete(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
