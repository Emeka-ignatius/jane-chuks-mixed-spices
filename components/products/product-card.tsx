"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Eye, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter(); // ← add

  const handleAddToCart = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post("/api/cart", {
        productId: product.id,
        quantity: 1,
      });

      if (res.data?.success) {
        toast.success(`${product.name} added to cart!`);
        router.refresh(); // re-render server comps (e.g., cart badge)
      } else {
        toast.error(res.data?.error ?? "Failed to add to cart");
      }
    } catch (err: any) {
      // If not logged in, your API returns 401
      if (err?.response?.status === 401) {
        toast.error("Please sign in to add items");
        router.push(
          `/auth/login?redirect=${encodeURIComponent(location.pathname)}`
        );
      } else {
        toast.error("Failed to add to cart");
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "Removed from favorites" : "Added to favorites");
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "men":
        return { label: "For Men", className: "bg-secondary" };
      case "women":
        return { label: "For Women", className: "bg-accent" };
      case "multipurpose":
        return { label: "Multi-Purpose", className: "bg-primary" };
      default:
        return { label: category, className: "bg-muted" };
    }
  };

  const badge = getCategoryBadge(product.category);

  return (
    <Card
      className="group interactive-card border-0 shadow-lg overflow-hidden"
      style={{ animationDelay: `${index * 0.1}s` }}>
      <CardContent className="p-0">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          <Badge className={`absolute top-3 left-3 z-10 ${badge.className}`}>
            {badge.label}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-3 right-3 z-10 bg-white/80 hover:bg-white ${
              isFavorite ? "text-red-500" : "text-muted-foreground"
            }`}
            onClick={handleToggleFavorite}>
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
          </Button>

          <Image
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
          />

          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
            <Button size="sm" variant="secondary" asChild>
              <Link href={`/products/${product.slug}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isLoading || product.stockQuantity === 0}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {isLoading ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg leading-tight text-balance">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>

          {/* Rating (Mock data for now) */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < 4
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">4.8</span>
            <span className="text-sm text-muted-foreground">(124 reviews)</span>
          </div>

          {/* Price & Stock */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-primary">
                  ₦{product.price.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {product.stockQuantity > 0
                  ? `${product.stockQuantity} in stock`
                  : "Out of stock"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-muted-foreground">Weight</p>
              <p className="text-sm font-medium">{product.weight}</p>
            </div>
          </div>

          {/* Quick Add to Cart */}
          <Button
            className="w-full"
            onClick={handleAddToCart}
            disabled={isLoading || product.stockQuantity === 0}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isLoading
              ? "Adding..."
              : product.stockQuantity === 0
              ? "Out of Stock"
              : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
