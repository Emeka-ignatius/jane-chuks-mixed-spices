"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Minus,
  Plus,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
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

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stockQuantity) {
      setQuantity(newQuantity);
    }
  };

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "men":
        return {
          label: "For Men",
          color: "bg-secondary",
          description: "Specially formulated for men's health",
        };
      case "women":
        return {
          label: "For Women",
          color: "bg-accent",
          description: "Crafted for women's wellness",
        };
      case "multipurpose":
        return {
          label: "Multi-Purpose",
          color: "bg-primary",
          description: "Perfect for the whole family",
        };
      default:
        return { label: category, color: "bg-muted", description: "" };
    }
  };

  const categoryInfo = getCategoryInfo(product.category);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-muted to-muted/50">
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-contain p-8"
              priority
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Badge className={categoryInfo.color}>
                  {categoryInfo.label}
                </Badge>
                <h1 className="text-3xl font-bold text-balance">
                  {product.name}
                </h1>
                <p className="text-muted-foreground">
                  {categoryInfo.description}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={isFavorite ? "text-red-500" : ""}>
                  <Heart
                    className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                  />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < 4
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">4.8</span>
              <span className="text-muted-foreground">(124 reviews)</span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold text-primary">
                  ₦{product.price.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">
                  per {product.weight}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {product.stockQuantity > 0
                  ? `${product.stockQuantity} units in stock`
                  : "Out of stock"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stockQuantity}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={isLoading || product.stockQuantity === 0}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                {isLoading
                  ? "Adding..."
                  : product.stockQuantity === 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </Button>
              <Button size="lg" variant="outline">
                Buy Now
              </Button>
            </div>
          </div>

          <Separator />

          {/* Features */}
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                icon: Shield,
                title: "NAFDAC Certified",
                description: "Quality assured",
              },
              {
                icon: Truck,
                title: "Free Delivery",
                description: "Orders above ₦5,000",
              },
              {
                icon: RotateCcw,
                title: "30-Day Returns",
                description: "Money back guarantee",
              },
            ].map((feature, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-8">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">Product Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>

                <div className="space-y-2">
                  <h4 className="font-medium">Directions for Use:</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.directionsForUse}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <h4 className="font-medium mb-2">Product Details:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>Weight: {product.weight}</li>
                      <li>Category: {categoryInfo.label}</li>
                      <li>100% Natural ingredients</li>
                      <li>NAFDAC certified</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Storage:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>Store in a cool, dry place</li>
                      <li>Keep away from direct sunlight</li>
                      <li>Seal properly after use</li>
                      <li>Best before 24 months</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ingredients" className="mt-8">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-semibold">Ingredients</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Active Ingredients:</h4>
                    <div className="space-y-2">
                      {product.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-sm">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Benefits:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Enhanced nutritional value</li>
                      <li>• Natural health support</li>
                      <li>• Rich in antioxidants</li>
                      <li>• Supports overall wellness</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <div className="space-y-4">
                    <div className="text-6xl">⭐</div>
                    <h3 className="text-xl font-semibold">
                      Customer Reviews Coming Soon
                    </h3>
                    <p className="text-muted-foreground">
                      We're working on bringing you authentic customer reviews
                      and ratings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
