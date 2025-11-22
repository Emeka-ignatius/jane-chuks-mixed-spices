"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Eye, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import MaxWidthWrapper from "../max-width-wrapper";

const featuredProducts = [
  {
    id: 1,
    name: "JaneChucks Mixed Spices (Multi-Purpose)",
    slug: "janechucks-mixed-spices-multi-purpose",
    category: "multipurpose",
    price: 15000,
    originalPrice: 20000,
    image: "/images/multi-purpose.jpg",
    rating: 4.8,
    reviews: 124,
    badge: "Best Seller",
    inStock: true,
    description: "Perfect for the whole family",
  },
  {
    id: 2,
    name: "JaneChucks Mixed Spices (For Women)",
    slug: "janechucks-mixed-spices-for-women",
    category: "women",
    price: 15000,
    originalPrice: 20000,
    image: "/images/for-women.jpg",
    rating: 4.9,
    reviews: 89,
    badge: "Premium",
    inStock: true,
    description: "Specially crafted for women's wellness",
  },
  {
    id: 3,
    name: "JaneChucks Mixed Spices (For Men)",
    slug: "janechucks-mixed-spices-for-men",
    category: "men",
    price: 15000,
    originalPrice: 20000,
    image: "/images/for-men.jpg",
    rating: 4.7,
    reviews: 76,
    badge: "New",
    inStock: true,
    description: "Formulated for men's vitality",
  },
];

export function FeaturedProducts() {
  return (
    <section className="py-20">
      <MaxWidthWrapper>
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge
              variant="secondary"
              className="inline-flex items-center space-x-2 px-4 py-2">
              <Star className="h-4 w-4" />
              <span>Featured Products</span>
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold gradient-text text-balance">
              Our Most Popular Spice Blends
            </h2>

            <p className="section-text text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover why thousands of customers trust JaneChucks Mixed Spices
              for their daily nutrition and wellness needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <Card
                key={product.id}
                className="group interactive-card border-0 shadow-lg overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-0">
                  {/* Product Image */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                    {product.badge && (
                      <Badge
                        className={`absolute top-3 left-3 z-10 ${
                          product.badge === "Best Seller"
                            ? "bg-primary"
                            : product.badge === "Premium"
                            ? "bg-accent"
                            : "bg-secondary"
                        }`}>
                        {product.badge}
                      </Badge>
                    )}

                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                      <Button size="sm" variant="secondary" asChild>
                        <Link href={`/products/${product.slug}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button size="sm">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg leading-tight text-balance">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {product.description}
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {product.rating}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({product.reviews} reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-primary">
                            ₦{product.price.toLocaleString()}
                          </span>
                          {product.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              ₦{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </p>
                      </div>

                      <Button variant="ghost" size="icon">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View All Products */}
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
