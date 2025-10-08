// Type definitions for JaneChucks Mixed Spices platform

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: "men" | "women" | "multipurpose";
  price: number;
  stockQuantity: number;
  weight: string | null;
  ingredients: string[];
  directionsForUse?: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  isAdmin: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  // Joined from products table
  name?: string;
  price?: number;
  imageUrl?: string;
  stockQuantity?: number;
}

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  totalAmount: number;
  shippingAmount: number;
  tax_amount: number;
  currency: string;
  shippingFirstName: string;
  shippingLastName: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode?: string;
  shippingCountry: string;
  shippingPhone: string;
  paymentMethod?: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentReference?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
  created_at: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  type: "shipping" | "billing";
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId: number;
  rating: number;
  reviewText?: string;
  isApproved: boolean;
  createdAt: string;
}

// Form types
export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
  paymentMethod: string;
  saveAddress: boolean;
  setAsDefault: boolean;
  specialInstructions: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  createdAt: string; // ISO string for safe serialization
  status: string;
  totalAmount: number;
  trackingNumber: string | null;
  orderItems: Array<{
    quantity: number;
    price: number;
    product: { name: string };
  }>;
}

interface TrackingItem {
  name: string;
  quantity: number;
  price: number; // numberified on the caller side
}

interface OrderTrackingModalProps {
  order: {
    id: string;
    status: OrderStatus;
    trackingNumber?: string | null;
    createdAt?: string | Date;
    shippedAt?: string | Date | null;
    deliveredAt?: string | Date | null;
    items: TrackingItem[];
  };
  isOpen: boolean;
  onClose: () => void;
}

interface IAddress {
  id: string;
  type: AddressTypeUI; // UI label
  isDefault: boolean;
  firstName: string;
  lastName: string;
  phone: string;
  address: string; // maps to addressLine1
  addressLine2?: string; // optional
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
}
