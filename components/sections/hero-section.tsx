"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Sparkles, Leaf, Heart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const heroSlides = [
  {
    id: 1,
    title: "Premium Mixed Spices",
    subtitle: "For Enhanced Wellness",
    description:
      "Discover our carefully crafted spice blends designed for men, women, and multipurpose use. Natural ingredients for better health and nutrition.",
    image: "/images/multi-purpose.jpg",
    badge: "Natural & Organic",
    cta: "Shop Now",
    accent: "primary",
  },
  {
    id: 2,
    title: "Specially for Women",
    subtitle: "Wellness & Vitality",
    description:
      "Our women's blend features watermelon seed, carrot seed, ginger, tigernuts, date, and maca root for reproductive health and overall wellness.",
    image: "/images/for-women.jpg",
    badge: "Women's Health",
    cta: "Explore Women's Blend",
    accent: "accent",
  },
  {
    id: 3,
    title: "Crafted for Men",
    subtitle: "Strength & Energy",
    description:
      "A powerful combination of ginger, cinnamon, garlic, and olive leaf specially formulated to support men's health and vitality.",
    image: "/images/for-men.png",
    badge: "Men's Vitality",
    cta: "Discover Men's Blend",
    accent: "secondary",
  },
]

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  const currentSlideData = heroSlides[currentSlide]

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,140,0,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,100,0,0.05)_25%,rgba(0,100,0,0.05)_50%,transparent_50%,transparent_75%,rgba(0,100,0,0.05)_75%)] bg-[length:60px_60px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className={`inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium ${
                  currentSlideData.accent === "primary"
                    ? "bg-primary/10 text-primary"
                    : currentSlideData.accent === "accent"
                      ? "bg-accent/10 text-accent"
                      : "bg-secondary/10 text-secondary"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>{currentSlideData.badge}</span>
              </Badge>

              <h1 className="hero-text font-bold gradient-text text-balance">{currentSlideData.title}</h1>

              <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground text-balance">
                {currentSlideData.subtitle}
              </h2>

              <p className="section-text text-muted-foreground max-w-2xl text-pretty">{currentSlideData.description}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="group relative overflow-hidden glow-animation" asChild>
                <Link href="/products">
                  <span className="relative z-10">{currentSlideData.cta}</span>
                  <div className="absolute inset-0 shimmer-effect" />
                </Link>
              </Button>

              <Button variant="outline" size="lg" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
              {[
                { icon: Leaf, text: "100% Natural" },
                { icon: Heart, text: "Health Focused" },
                { icon: Sparkles, text: "Premium Quality" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <feature.icon className="h-4 w-4 text-primary" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative aspect-square max-w-md mx-auto float-animation">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
              <div className="relative bg-card rounded-3xl p-8 shadow-2xl interactive-card">
                <Image
                  src={currentSlideData.image || "/placeholder.svg"}
                  alt={currentSlideData.title}
                  width={400}
                  height={400}
                  className="w-full h-full object-contain rounded-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Slide Controls */}
        <div className="flex items-center justify-center space-x-4 mt-12">
          <Button variant="outline" size="icon" onClick={prevSlide} className="rounded-full bg-transparent">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex space-x-2">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide
                    ? "bg-primary scale-125"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          <Button variant="outline" size="icon" onClick={nextSlide} className="rounded-full bg-transparent">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  )
}
