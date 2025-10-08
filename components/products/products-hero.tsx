import { Badge } from "@/components/ui/badge"
import { Leaf, Award, Shield } from "lucide-react"

export function ProductsHero() {
  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <Badge variant="secondary" className="inline-flex items-center space-x-2 px-4 py-2">
            <Leaf className="h-4 w-4" />
            <span>Premium Spice Collection</span>
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold gradient-text text-balance">
            Discover Our Premium Spice Blends
          </h1>

          <p className="text-lg text-muted-foreground text-pretty">
            Explore our carefully crafted collection of natural spice blends, each formulated with specific health
            benefits and premium ingredients sourced from the finest suppliers.
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-6 pt-4">
            {[
              { icon: Award, text: "NAFDAC Certified" },
              { icon: Leaf, text: "100% Natural" },
              { icon: Shield, text: "Quality Guaranteed" },
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                <item.icon className="h-4 w-4 text-primary" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
