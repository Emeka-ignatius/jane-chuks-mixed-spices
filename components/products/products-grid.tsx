import { getProducts } from "@/lib/database";
import { ProductCard } from "@/components/products/product-card";

interface ProductsGridProps {
  category?: string;
  search?: string;
}

export async function ProductsGrid({ category, search }: ProductsGridProps) {
  const products = await getProducts(category);

  // Filter by search term if provided
  const filteredProducts = search
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description?.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="text-6xl">🔍</div>
          <h3 className="text-xl font-semibold">No products found</h3>
          <p className="text-muted-foreground">
            {search
              ? `No products match "${search}"`
              : "No products available in this category"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {category
              ? `${
                  category.charAt(0).toUpperCase() + category.slice(1)
                } Products`
              : "All Products"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} product
            {filteredProducts.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
}
