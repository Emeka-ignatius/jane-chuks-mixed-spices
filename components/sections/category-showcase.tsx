"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import MaxWidthWrapper from "../max-width-wrapper";

const categories = [
  {
    id: "men",
    title: "For Men",
    subtitle: "Strength & Vitality",
    description:
      "Specially formulated with ginger, cinnamon, garlic, and olive leaf to support men's health and energy levels.",
    image: "/images/for-men.png",
    price: "₦2,500",
    icon: Users,
    color: "from-secondary to-secondary/80",
    badge: "Men's Health",
  },
  {
    id: "women",
    title: "For Women",
    subtitle: "Wellness & Beauty",
    description:
      "A nourishing blend with watermelon seed, carrot seed, ginger, tigernuts, date, and maca root for women's wellness.",
    image: "/images/for-women.jpg",
    price: "₦2,500",
    icon: Heart,
    color: "from-accent to-accent/80",
    badge: "Women's Wellness",
  },
  {
    id: "multipurpose",
    title: "Multi-Purpose",
    subtitle: "For Everyone",
    description:
      "Our versatile blend perfect for the whole family. Enhanced nutrition and flavor for all your cooking needs.",
    image: "/images/multi-purpose.jpg",
    price: "₦2,200",
    icon: Sparkles,
    color: "from-primary to-primary/80",
    badge: "Family Blend",
  },
];

export function CategoryShowcase() {
  return (
    <section className="py-20 bg-muted/30">
      <MaxWidthWrapper>
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge
              variant="secondary"
              className="inline-flex items-center space-x-2 px-4 py-2">
              <Sparkles className="h-4 w-4" />
              <span>Our Categories</span>
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold gradient-text text-balance">
              Spices Crafted for Every Need
            </h2>

            <p className="section-text text-muted-foreground max-w-2xl mx-auto text-pretty">
              Discover our specialized spice blends, each carefully formulated
              with premium natural ingredients to support specific health and
              wellness goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Card
                key={category.id}
                className="group interactive-card border-0 shadow-lg overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`h-2 bg-gradient-to-r ${category.color}`} />

                <CardContent className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">
                        {category.badge}
                      </Badge>
                      <h3 className="text-xl font-bold">{category.title}</h3>
                      <p className="text-sm text-muted-foreground font-medium">
                        {category.subtitle}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${category.color}`}>
                      <category.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>

                  {/* Product Image */}
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.title}
                      fill
                      className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                    {category.description}
                  </p>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        Starting from
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {category.price}
                      </p>
                    </div>

                    <Button className="group/btn" asChild>
                      <Link href={`/products?category=${category.id}`}>
                        Shop Now
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* View All Products */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link href="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
