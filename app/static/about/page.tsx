import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, Award, Users, Heart } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <Badge className=" text-white px-4 py-2">About JaneChucks</Badge>
            <h1 className="text-xl text-center ic md:text-5xl font-bold text-spice-brown">
              Crafting Premium Spice Blends for{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Healthy Living
              </span>
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              At JaneChucks Mixed Spices, we believe that great health starts
              with great ingredients. Our carefully crafted spice blends are
              designed to nourish your body while delighting your taste buds.
            </p>
          </div>

          {/* Story Section */}
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="p-8 md:p-12 space-y-6">
                  <h2 className="text-3xl font-bold text-foreground">
                    Our Story
                  </h2>
                  <div className="space-y-4 text-neutral-600">
                    <p>
                      {` Founded with a passion for natural wellness, JaneChucks
                      Mixed Spices began as a mission to create specialized
                      spice blends that cater to different health needs and
                      preferences.`}
                    </p>
                    <p>
                      {` Our founder, Jane, discovered the power of traditional
                      Nigerian spices and herbs in promoting health and
                      vitality. Through years of research and collaboration with
                      nutritionists, we developed our signature blends.`}
                    </p>
                    <p>
                      {`Today, we're proud to offer three distinct formulations:
                      specially crafted blends for women's health, men's
                      vitality, and our versatile multi-purpose blend for
                      everyday wellness.`}
                    </p>
                  </div>
                </div>
                <div className="relative h-64 md:h-full bg-gradient-to-br from-primary/20 to-secondary/20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl">🌿</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Values Section */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-spice-brown mb-4">
                Our Values
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Everything we do is guided by our commitment to quality, health,
                and customer satisfaction.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Leaf,
                  title: "Natural Ingredients",
                  description:
                    "We source only the finest natural spices and herbs, ensuring purity and potency in every blend.",
                },
                {
                  icon: Award,
                  title: "Quality Assured",
                  description:
                    "Our products are NAFDAC registered and meet the highest standards of quality and safety.",
                },
                {
                  icon: Users,
                  title: "Customer Focused",
                  description:
                    "We listen to our customers and continuously improve our products based on their feedback.",
                },
                {
                  icon: Heart,
                  title: "Health First",
                  description:
                    "Every blend is formulated with health benefits in mind, supporting your wellness journey.",
                },
              ].map((value, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-sm hover:shadow-md transition-shadow text-center">
                  <CardContent className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-spice-brown">
                      {value.title}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Products Overview */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6">
                <h2 className="text-3xl font-bold text-spice-brown">
                  Our Product Range
                </h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  Each of our spice blends is carefully formulated to address
                  specific health needs and preferences.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mt-12">
                {[
                  {
                    name: "For Women",
                    image: "/images/for-women.jpg",
                    ingredients:
                      "Watermelon seed, Carrot seed, Ginger, Tigernuts, Date, Maca root",
                    benefits: "Supports women's health and vitality",
                  },
                  {
                    name: "For Men",
                    image: "/images/for-men.png",
                    ingredients: "Ginger, Cinnamon, Garlic, Olive leaf",
                    benefits: "Promotes men's strength and energy",
                  },
                  {
                    name: "Multi-Purpose",
                    image: "/images/multi-purpose.jpg",
                    ingredients: "Ginger, Cinnamon, Garlic, Olive leaf",
                    benefits: "Versatile blend for everyday wellness",
                  },
                ].map((product, index) => (
                  <div key={index} className="text-center space-y-4">
                    <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden shadow-md">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-spice-brown text-lg">
                        {product.name}
                      </h3>
                      <p className="text-sm text-neutral-600 mt-2">
                        {product.ingredients}
                      </p>
                      <p className="text-sm text-primary font-medium mt-1">
                        {product.benefits}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-spice-green/5">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <h2 className="text-3xl font-bold text-spice-brown">
                Get in Touch
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Have questions about our products or want to learn more about
                our story? We'd love to hear from you.
              </p>
              <div className="space-y-2 text-sm text-neutral-600">
                <p>
                  <strong>Email:</strong> reversoploutosltd@gmail.com
                </p>
                <p>
                  <strong>Location:</strong> Calabar, Cross River State, Nigeria
                </p>
                <p>
                  <strong>Company:</strong> Reverso-Ploutos Ltd
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
