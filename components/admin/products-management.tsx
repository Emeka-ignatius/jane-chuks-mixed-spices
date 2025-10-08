"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, Filter } from "lucide-react"
import Image from "next/image"
import { getAdminProducts } from "@/app/actions/admin"
import { toast } from "sonner"

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
  status: string
  image: string
  sold: number
}

export function ProductsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setFilteredProducts(products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase())))
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const loadProducts = async () => {
    try {
      setIsLoading(true)
      const result = await getAdminProducts()
      if (result.error) {
        toast.error(result.error)
        return
      }
      setProducts(result.data || [])
      setFilteredProducts(result.data || [])
    } catch (error) {
      toast.error("Failed to load products")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spice-orange mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-spice-brown">Products</h1>
          <p className="text-neutral-600 mt-1">Manage your spice products</p>
        </div>
        <Button className="bg-spice-orange hover:bg-spice-orange/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-neutral-500">No products found</div>
        ) : (
          filteredProducts.map((product) => (
            <Card key={product.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-neutral-100">
                    <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </div>
                  <Badge variant={product.status === "Active" ? "default" : "destructive"}>{product.status}</Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-spice-brown line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-neutral-600">{product.category}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-spice-orange">₦{product.price.toLocaleString()}</span>
                    <span className="text-sm text-neutral-600">{product.stock} in stock</span>
                  </div>

                  <div className="text-sm text-neutral-600">
                    <span className="font-medium">{product.sold}</span> sold
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
