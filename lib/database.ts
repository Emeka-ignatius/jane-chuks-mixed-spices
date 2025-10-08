import { Prisma, UserRole } from "@prisma/client";
import { db } from "./db";

// Product functions
export async function getProducts(category?: string) {
  const products = await db.product.findMany({
    where: {
      ...(category && { category: category as any }),
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map((product) => ({
    ...product,
    id: String(product.id), // ensure string
    price: Number(product.price), // Decimal → number
    stockQuantity: Number(product.stockQuantity),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }));
}

export async function getProductBySlug(slug: string) {
  const product = await db.product.findFirst({
    where: {
      slug,
      isActive: true,
    },
  });

  if (!product) return null;

  return {
    ...product,
    id: String(product.id), // ensure string
    price: Number(product.price), // Decimal → number
    stockQuantity: Number(product.stockQuantity),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export async function getProductById(id: string) {
  return await db.product.findUnique({
    where: { id },
  });
}

// User functions
export async function getUserById(id: string) {
  return await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isAdmin: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      passwordHash: true,
    },
  });
}

export async function getUserByEmail(email: string) {
  return await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      isAdmin: true,
      emailVerified: true,
      passwordHash: true,
      resetToken: true,
      resetTokenExpiry: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createUser(userData: {
  email: string;
  name?: string;
  phone?: string;
  passwordHash: string;
  role?: UserRole | string;
}) {
  return await db.user.create({
    data: {
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      passwordHash: userData.passwordHash,
      role: (userData.role as any) ?? undefined,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      phone: true,
      isAdmin: true,
      emailVerified: true,
      createdAt: true,
    },
  });
}

export async function updateUserResetToken(
  userId: string,
  resetToken: string,
  expiryDate: Date
) {
  return await db.user.update({
    where: { id: userId },
    data: {
      resetToken,
      resetTokenExpiry: expiryDate,
    },
  });
}

export async function getUserByResetToken(resetToken: string) {
  return await db.user.findFirst({
    where: {
      resetToken,
      resetTokenExpiry: {
        gt: new Date(),
      },
    },
  });
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  return await db.user.update({
    where: { id: userId },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });
}

// Cart functions
export async function getCartItems(userId: string) {
  const items = await db.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          stockQuantity: true,
          slug: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return items.map((item) => ({
    id: String(item.product.id), // ← use product id as the "id"
    productId: String(item.productId),
    quantity: item.quantity,
    name: item.product.name,
    price: Number(item.product.price),
    image: item.product.imageUrl, // ← unified key
    slug: item.product.slug,
    stockQuantity: Number(item.product.stockQuantity),
  }));
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity = 1
) {
  console.log(
    " Adding to cart - userId:",
    userId,
    "productId:",
    productId,
    "quantity:",
    quantity
  );

  const result = await db.cartItem.upsert({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    update: {
      quantity: {
        increment: quantity,
      },
    },
    create: {
      userId,
      productId,
      quantity,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          stockQuantity: true,
          slug: true,
        },
      },
    },
  });

  console.log(" Cart item created/updated:", result);
  return {
    ...result,
    product: {
      ...result.product,
      price: Number(result.product.price),
    },
  };
}

export async function updateCartItemQuantity(
  userId: string,
  productId: string,
  quantity: number
) {
  if (quantity <= 0) {
    return await db.cartItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
  }

  const result = await db.cartItem.update({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    data: {
      quantity,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          price: true,
          imageUrl: true,
          stockQuantity: true,
          slug: true,
        },
      },
    },
  });

  return {
    ...result,
    product: {
      ...result.product,
      price: Number(result.product.price),
    },
  };
}

export async function removeFromCart(userId: string, productId: string) {
  return await db.cartItem.delete({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });
}

export async function clearCart(userId: string) {
  return await db.cartItem.deleteMany({
    where: { userId },
  });
}

// Order functions
export async function createOrder(orderData: {
  userId?: string | null;
  orderNumber: string;
  totalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingAddressLine1?: string;
  shippingAddressLine2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  shippingPhone?: string;
  paymentMethod?: string;
  items: Array<{
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
    totalPrice: number;
  }>;
}) {
  const { items, ...orderInfo } = orderData;

  return db.order.create({
    data: {
      userId: orderInfo.userId ?? null,
      orderNumber: orderInfo.orderNumber,
      totalAmount: new Prisma.Decimal(orderInfo.totalAmount),
      shippingAmount: new Prisma.Decimal(orderInfo.shippingAmount),
      taxAmount: new Prisma.Decimal(orderInfo.taxAmount),
      orderItems: {
        create: items.map((it) => ({
          productId: it.productId,
          productName: it.productName,
          productPrice: new Prisma.Decimal(it.productPrice),
          quantity: it.quantity,
          totalPrice: new Prisma.Decimal(it.totalPrice),
        })),
      },
    },
    include: {
      orderItems: true,
    },
  });
}

export async function getOrdersByUserId(userId: string) {
  return await db.order.findMany({
    where: { userId },
    include: {
      orderItems: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getOrderByNumber(orderNumber: string) {
  return await db.order.findUnique({
    where: { orderNumber },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

export async function getAllOrders() {
  return await db.order.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function updateOrderStatus(orderId: string, status: string) {
  return await db.order.update({
    where: { id: orderId },
    data: {
      status: status as any,
      ...(status === "shipped" && { shippedAt: new Date() }),
      ...(status === "delivered" && { deliveredAt: new Date() }),
    },
  });
}

export async function updateOrderTracking(
  orderId: string,
  trackingNumber: string
) {
  return await db.order.update({
    where: { id: orderId },
    data: {
      trackingNumber,
    },
  });
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: string,
  paymentReference?: string
) {
  return await db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: paymentStatus as any,
      ...(paymentReference && { paymentReference }),
    },
  });
}

// Address functions
export async function getUserAddresses(userId: string) {
  return await db.userAddress.findMany({
    where: { userId },
    orderBy: {
      isDefault: "desc",
    },
  });
}

type CreateUserAddressInput = {
  userId: string;
  type: "shipping" | "billing";
  firstName?: string | null;
  lastName?: string | null;
  addressLine1: string | null;
  addressLine2?: string | null;
  city: string | null;
  state: string | null;
  postalCode?: string | null;
  country: string | null;
  phone?: string | null;
  isDefault?: boolean | null;
};

export async function createUserAddress(addressData: CreateUserAddressInput) {
  // If this is set as default, unset other defaults

  const data = {
    type: (addressData.type ?? "shipping") as "shipping" | "billing",
    firstName: addressData.firstName ?? "",
    lastName: addressData.lastName ?? "",
    addressLine1: addressData.addressLine1 ?? "", // required
    addressLine2: addressData.addressLine2 ?? "",
    city: addressData.city ?? "", // required
    state: addressData.state ?? "", // required
    postalCode: addressData.postalCode ?? "",
    country: addressData.country ?? "Nigeria",
    phone: addressData.phone ?? "",
    isDefault: Boolean(addressData.isDefault),
  };

  if (!data.addressLine1 || !data.city || !data.state) {
    throw new Error("addressLine1, city and state are required");
  }

  if (data.isDefault) {
    await db.userAddress.updateMany({
      where: { userId: addressData.userId, type: data.type },
      data: { isDefault: false },
    });
  }

  return await db.userAddress.create({
    data: {
      ...data,
      user: { connect: { id: addressData.userId } },
    },
  });
}

type UpdateUserAddressInput = Partial<{
  firstName: string | null;
  lastName: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  phone: string | null;
  isDefault: boolean | null;
}>;

export async function updateUserAddress(
  addressId: string,
  input: UpdateUserAddressInput
) {
  const data = {
    firstName: input.firstName ?? undefined,
    lastName: input.lastName ?? undefined,
    addressLine1: input.addressLine1 ?? undefined,
    addressLine2: input.addressLine2 ?? undefined,
    city: input.city ?? undefined,
    state: input.state ?? undefined,
    postalCode: input.postalCode ?? undefined,
    country: input.country ?? undefined,
    phone: input.phone ?? undefined,
    isDefault: input.isDefault ?? undefined,
  };

  return await db.userAddress.update({
    where: { id: addressId },
    data,
  });
}

export async function deleteUserAddress(addressId: string) {
  return await db.userAddress.delete({
    where: { id: addressId },
  });
}

// Admin functions
export async function createAdminLog(logData: {
  adminId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: any;
}) {
  return await db.adminLog.create({
    data: logData,
  });
}
