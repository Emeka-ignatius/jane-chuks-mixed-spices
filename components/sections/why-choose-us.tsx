"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Shield, Award, Truck, Heart, Users } from "lucide-react";
import MaxWidthWrapper from "../max-width-wrapper";

const features = [
  {
    icon: Leaf,
    title: "100% Natural Ingredients",
    description:
      "All our spices are sourced from premium natural ingredients with no artificial additives or preservatives.",
    color: "from-green-500 to-green-600",
  },
  {
    icon: Shield,
    title: "NAFDAC Certified",
    description:
      "Our products are certified by NAFDAC, ensuring the highest standards of quality and safety.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: Award,
    title: "Premium Quality",
    description:
      "Carefully selected and processed ingredients to deliver the finest quality spice blends for your health.",
    color: "from-yellow-500 to-yellow-600",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "Quick and reliable delivery across Nigeria, ensuring your spices reach you fresh and on time.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: Heart,
    title: "Health Focused",
    description:
      "Each blend is formulated with specific health benefits in mind, supporting your wellness journey.",
    color: "from-red-500 to-red-600",
  },
  {
    icon: Users,
    title: "Trusted by Thousands",
    description:
      "Join thousands of satisfied customers who have made JaneChucks their trusted spice partner.",
    color: "from-indigo-500 to-indigo-600",
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-20 bg-muted/30">
      <MaxWidthWrapper>
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge
              variant="secondary"
              className="inline-flex items-center space-x-2 px-4 py-2">
              <Award className="h-4 w-4" />
              <span>Why Choose Us</span>
            </Badge>

            <h2 className="text-3xl md:text-4xl font-bold gradient-text text-balance">
              The JaneChucks Difference
            </h2>

            <p className="section-text text-muted-foreground max-w-2xl mx-auto text-pretty">
              We're committed to providing you with the highest quality spice
              blends that not only enhance your meals but also support your
              health and wellness goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group interactive-card border-0 shadow-lg"
                style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t">
            {[
              { number: "5000+", label: "Happy Customers" },
              { number: "3", label: "Product Categories" },
              { number: "100%", label: "Natural Ingredients" },
              { number: "24/7", label: "Customer Support" },
            ].map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-3xl md:text-4xl font-bold gradient-text">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
