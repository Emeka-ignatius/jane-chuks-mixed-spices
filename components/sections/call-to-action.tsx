"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Gift } from "lucide-react";
import Link from "next/link";
import MaxWidthWrapper from "../max-width-wrapper";

export function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground relative overflow-hidden">
      <MaxWidthWrapper>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 text-white border-white/30">
                <Gift className="h-4 w-4" />
                <span>Special Offer</span>
              </Badge>

              <h2 className="text-3xl md:text-5xl font-bold text-balance">
                Ready to Transform Your Health?
              </h2>

              <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto text-pretty">
                Join thousands of satisfied customers who have made JaneChucks
                Mixed Spices part of their daily wellness routine. Start your
                journey to better health today.
              </p>
            </div>

            {/* Features */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              {[
                "Free Delivery on Orders Above ₦5,000",
                "100% Natural Ingredients",
                "NAFDAC Certified",
                "30-Day Money Back Guarantee",
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 shadow-lg glow-animation"
                asChild>
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 border-t border-white/20">
              <p className="text-sm text-primary-foreground/70 mb-4">
                Trusted by over 5,000+ customers across Nigeria
              </p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="text-xs">NAFDAC Certified</div>
                <div className="w-px h-4 bg-white/30" />
                <div className="text-xs">100% Natural</div>
                <div className="w-px h-4 bg-white/30" />
                <div className="text-xs">Made in Nigeria</div>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
