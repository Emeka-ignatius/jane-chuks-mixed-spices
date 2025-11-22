import bcrypt from "bcryptjs";
import { PrismaClient, ProductCategory } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@janechuks.com" },
    update: {},
    create: {
      email: "admin@janechuks.com",
      passwordHash: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
      isAdmin: true,
      emailVerified: true,
    },
  });

  console.log("✅ Admin user created:", admin.email);

  // Create products
  const products = [
    {
      name: "Multi-Purpose Spice Mix",
      slug: "multi-purpose-spice-mix",
      description:
        "A versatile blend of premium spices perfect for all your cooking needs. This carefully crafted mix combines aromatic herbs and spices to enhance the flavor of any dish.",
      price: 15000,
      category: ProductCategory.multipurpose,
      stockQuantity: 100,
      imageUrl: "/images/multi-purpose.jpg",
      featured: true,
    },
    {
      name: "Women's Special Blend",
      slug: "womens-special-blend",
      description:
        "A specially formulated spice blend designed with women's health and taste preferences in mind. Rich in flavor and beneficial nutrients.",
      price: 15000,
      category: ProductCategory.women,
      stockQuantity: 75,
      imageUrl: "/images/for-women.jpg",
      featured: true,
    },
    {
      name: "Men's Power Mix",
      slug: "mens-power-mix",
      description:
        "A robust and bold spice blend crafted for hearty meals. Perfect for grilling, roasting, and adding depth to your favorite dishes.",
      price: 15000,
      category: ProductCategory.men,
      stockQuantity: 80,
      imageUrl: "/images/for-men.jpg",
      featured: true,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
    console.log("✅ Product created:", created.name);
  }

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
