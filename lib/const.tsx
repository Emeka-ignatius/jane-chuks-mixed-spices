import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  HomeIcon,
  PenBoxIcon,
  Shield,
  PhoneIcon,
} from "lucide-react";

export const publicNavItems: { href: string; label: string; icon: any }[] = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/products", label: "Products", icon: Package },
  { href: "/static/about", label: "About Us", icon: PenBoxIcon },
  { href: "/static/services", label: "Services", icon: Shield },
  { href: "/static/contact", label: "Contact", icon: PhoneIcon },
];

export const adminNavItems: {
  href: string;
  label: string;
  icon: any;
}[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  //   { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  //   { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default {};
