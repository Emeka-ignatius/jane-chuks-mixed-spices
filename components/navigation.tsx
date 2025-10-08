"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  ShoppingCart,
  User,
  Search,
  LogOut,
  Package,
  Settings,
} from "lucide-react";
import { useUser } from "@/components/auth/auth-provider";
import Image from "next/image";
import { getInitials } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const user = useUser();
  const router = useRouter();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/static/about", label: "About Us" },
    { href: "/static/services", label: "Services" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/contact", label: "Contact" },
  ];

  useEffect(() => {
    let abort = false;

    const updateFromGuest = () => {
      try {
        const raw = localStorage.getItem("guest-cart");
        const arr = raw ? JSON.parse(raw) : [];
        const count = Array.isArray(arr)
          ? arr.reduce(
              (sum: number, it: any) => sum + Number(it?.quantity ?? 1),
              0
            )
          : 0;
        if (!abort) setCartCount(count);
      } catch {
        if (!abort) setCartCount(0);
      }
    };

    const updateFromAPI = async () => {
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (!res.ok) throw new Error("cart fetch failed");
        const json = await res.json();
        const count = (json?.items ?? []).reduce(
          (sum: number, it: any) => sum + Number(it?.quantity ?? 1),
          0
        );
        if (!abort) setCartCount(count);
      } catch {
        if (!abort) setCartCount(0);
      }
    };

    if (user) updateFromAPI();
    else updateFromGuest();

    // Refresh on storage changes (guest cart) and when window regains focus
    const onStorage = (e: StorageEvent) => {
      if (e.key === "guest-cart" && !user) updateFromGuest();
    };
    const onFocus = () => {
      if (user) updateFromAPI();
      else updateFromGuest();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);

    return () => {
      abort = true;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [user]);

  const handleLogout = async () => {
    await user?.signOut();
    setIsOpen(false);
    router.push("/"); // optional
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/bio-haventransparent.png"
              width={120}
              height={120}
              alt="JaneChuks Mixed Spices"
              className="h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary">
                {item.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex">
              <Search className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              asChild
              aria-label={`Cart (${cartCount})`}>
              <Link href="/cart">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 min-w-[1.25rem] px-1 rounded-full p-0 text-[10px] leading-none flex items-center justify-center">
                    {cartCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User Menu */}
            <div className="hidden sm:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                      aria-label="Account menu">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getInitials(user.displayName || user.primaryEmail)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user.displayName && (
                          <p className="font-medium">{user.displayName}</p>
                        )}
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.primaryEmail}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/orders">
                        <Package className="mr-2 h-4 w-4" />
                        Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile?tab=settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  aria-label="Sign in">
                  <Link href="/auth/login">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            <div className="sm:hidden">
              {user ? (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  aria-label="Profile">
                  <Link href="/profile">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getInitials(user.displayName || user.primaryEmail)}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  aria-label="Sign in">
                  <Link href="/auth/login">
                    <User className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] px-3.5 sm:w-[480px]">
                {/* User header */}
                <div className="mt-6 mb-4 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(user?.displayName || user?.primaryEmail)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {user?.displayName || "Welcome!"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.primaryEmail || "Sign in to view your account"}
                    </p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid w-full grid-cols-3 gap-2 mb-4">
                  <Button
                    asChild
                    variant="secondary"
                    className="bg-secondary/60 w-full px-2">
                    <Link href="/cart" onClick={() => setIsOpen(false)}>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Cart
                      {cartCount > 0 && (
                        <span className="ml-1 text-xs font-semibold">
                          ({cartCount})
                        </span>
                      )}
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    className="bg-secondary/60">
                    <Link href="/orders" onClick={() => setIsOpen(false)}>
                      <Package className="mr-2 h-4 w-4" />
                      Orders
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="secondary"
                    className="bg-secondary/60">
                    <Link
                      href={user ? "/profile" : "/auth/login"}
                      onClick={() => setIsOpen(false)}>
                      <User className="mr-2 h-4 w-4" />
                      {user ? "Profile" : "Login"}
                    </Link>
                  </Button>
                </div>

                {/* Nav items */}
                <div className="flex flex-col space-y-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-base font-medium transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </div>

                {/* Auth actions */}
                <div className="mt-6 border-t pt-4 space-y-2">
                  {user ? (
                    <Button
                      variant="outline"
                      className="w-full bg-transparent"
                      onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  ) : (
                    <>
                      <Button className="w-full" asChild>
                        <Link
                          href="/auth/login"
                          onClick={() => setIsOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full bg-transparent"
                        asChild>
                        <Link
                          href="/auth/signup"
                          onClick={() => setIsOpen(false)}>
                          Create Account
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
