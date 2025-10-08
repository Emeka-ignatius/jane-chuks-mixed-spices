"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Quote, Play, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const testimonials = [
  {
    id: 1,
    name: "Adaora Okafor",
    location: "Lagos, Nigeria",
    rating: 5,
    text: "JaneChucks Mixed Spices for Women has been a game-changer for my health. I feel more energetic and my overall wellness has improved significantly.",
    product: "For Women",
    avatar: "/diverse-woman-portrait.png",
  },
  {
    id: 2,
    name: "Emeka Nwankwo",
    location: "Abuja, Nigeria",
    rating: 5,
    text: "The men's blend is incredible! I've been using it for 3 months now and I can feel the difference in my energy levels and overall vitality.",
    product: "For Men",
    avatar: "/man.jpg",
  },
  {
    id: 3,
    name: "Fatima Ibrahim",
    location: "Kano, Nigeria",
    rating: 5,
    text: "Our whole family loves the multi-purpose blend. It adds amazing flavor to our meals while providing health benefits. Highly recommended!",
    product: "Multi-Purpose",
    avatar: "/diverse-woman-portrait.png",
  },
]

export function TestimonialsPreview() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="inline-flex items-center space-x-2 px-4 py-2">
            <Quote className="h-4 w-4" />
            <span>Customer Stories</span>
          </Badge>

          <h2 className="text-3xl md:text-4xl font-bold gradient-text text-balance">What Our Customers Say</h2>

          <p className="section-text text-muted-foreground max-w-2xl mx-auto text-pretty">
            Don't just take our word for it. Here's what real customers are saying about their experience with
            JaneChucks Mixed Spices.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="interactive-card border-0 shadow-lg"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 space-y-4">
                {/* Rating */}
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                  <p className="text-sm leading-relaxed text-pretty pl-6">{testimonial.text}</p>
                </div>

                {/* Customer Info */}
                <div className="flex items-center space-x-3 pt-4 border-t">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {testimonial.product}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Video Testimonial */}
        <Card className="max-w-4xl mx-auto interactive-card border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg glow-animation">
                    <Play className="h-8 w-8 text-primary-foreground ml-1" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Watch Customer Stories</h3>
                    <p className="text-sm text-muted-foreground">
                      Hear directly from our customers about their experience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* View All Testimonials */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link href="/testimonials">
              View All Testimonials
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
