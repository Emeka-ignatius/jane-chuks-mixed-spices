import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Shield,
  Headphones,
  RefreshCw,
  Package,
  Clock,
} from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <Badge className="bg-secondary text-white px-4 py-2">
              Our Services
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-spice-brown">
              Premium Service for{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Premium Products
              </span>
            </h1>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
              We're committed to providing exceptional service at every step of
              your journey with JaneChucks Mixed Spices.
            </p>
          </div>

          {/* Main Services */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Truck,
                title: "Fast Delivery",
                description:
                  "Quick and reliable delivery across Nigeria. Most orders arrive within 3-5 business days.",
                features: [
                  "Free shipping on orders over ₦5,000",
                  "Express delivery available",
                  "Real-time tracking",
                ],
              },
              {
                icon: Shield,
                title: "Quality Guarantee",
                description:
                  "100% satisfaction guaranteed. If you're not happy with your purchase, we'll make it right.",
                features: [
                  "NAFDAC registered products",
                  "Fresh ingredients guarantee",
                  "30-day return policy",
                ],
              },
              {
                icon: Headphones,
                title: "Customer Support",
                description:
                  "Our friendly support team is here to help with any questions or concerns you may have.",
                features: [
                  "Email support",
                  "WhatsApp assistance",
                  "Product guidance",
                ],
              },
              {
                icon: RefreshCw,
                title: "Easy Returns",
                description:
                  "Simple return process if you're not completely satisfied with your purchase.",
                features: [
                  "Hassle-free returns",
                  "Full refund policy",
                  "Quick processing",
                ],
              },
              {
                icon: Package,
                title: "Secure Packaging",
                description:
                  "Your spices arrive fresh and intact with our premium packaging solutions.",
                features: [
                  "Moisture-proof packaging",
                  "Tamper-evident seals",
                  "Eco-friendly materials",
                ],
              },
              {
                icon: Clock,
                title: "Order Tracking",
                description:
                  "Stay updated on your order status from processing to delivery with real-time tracking.",
                features: [
                  "SMS notifications",
                  "Email updates",
                  "Online tracking portal",
                ],
              },
            ].map((service, index) => (
              <Card
                key={index}
                className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-spice-brown">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-neutral-600">{service.description}</p>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="text-sm text-neutral-600 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Delivery Information */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8 md:p-12">
              <div className="text-center space-y-6 mb-8">
                <h2 className="text-3xl font-bold text-spice-brown">
                  Delivery Information
                </h2>
                <p className="text-neutral-600 max-w-2xl mx-auto">
                  We deliver nationwide across Nigeria with flexible shipping
                  options to suit your needs.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-spice-brown">
                    Shipping Options
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-spice-brown">
                          Standard Delivery
                        </h4>
                        <p className="text-sm text-neutral-600">
                          3-5 business days
                        </p>
                      </div>
                      <span className="font-semibold text-primary">₦1,500</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-spice-brown">
                          Express Delivery
                        </h4>
                        <p className="text-sm text-neutral-600">
                          1-2 business days
                        </p>
                      </div>
                      <span className="font-semibold text-primary">₦3,000</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-secondary/10 rounded-lg border border-sebg-secondary/20">
                      <div>
                        <h4 className="font-medium text-spice-brown">
                          Free Shipping
                        </h4>
                        <p className="text-sm text-neutral-600">
                          Orders over ₦5,000
                        </p>
                      </div>
                      <span className="font-semibold text-secondary">Free</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-spice-brown">
                    Coverage Areas
                  </h3>
                  <div className="space-y-3">
                    {[
                      "Lagos State",
                      "Abuja (FCT)",
                      "Rivers State",
                      "Kano State",
                      "Oyo State",
                      "Cross River State",
                      "And all other Nigerian states",
                    ].map((area, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-secondary rounded-full mr-3" />
                        <span className="text-neutral-600">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-sebg-secondary/5">
            <CardContent className="p-8 md:p-12 text-center space-y-6">
              <h2 className="text-3xl font-bold text-spice-brown">
                Ready to Experience Our Service?
              </h2>
              <p className="text-neutral-600 max-w-2xl mx-auto">
                Join thousands of satisfied customers who trust JaneChucks Mixed
                Spices for their wellness journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Shop Now
                </Button>
                <Button size="lg" variant="outline">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
