import { getProducts } from "@/lib/database";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/types";

interface RelatedProductsProps {
  currentProduct: Product;
}

export async function RelatedProducts({
  currentProduct,
}: RelatedProductsProps) {
  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter((product) => String(product.id) !== String(currentProduct.id))
    .slice(0, 3);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold gradient-text">
            You Might Also Like
          </h2>
          <p className="text-muted-foreground">
            Discover more premium spice blends from our collection
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
