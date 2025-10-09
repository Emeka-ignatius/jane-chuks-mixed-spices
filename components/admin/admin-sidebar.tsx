// components/admin/admin-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut, LogIn } from "lucide-react";
import { adminNavItems } from "@/lib/const";
import { useAuth } from "@/components/auth/auth-provider";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "ADMIN" || user?.isAdmin === true;

  // Optional: show nothing while checking auth to avoid flicker
  if (isLoading) {
    return null;
  }

  return (
    <div
      className={cn(
        "hidden md:flex md:flex-col w-64 flex-shrink-0 border-r border-neutral-200 bg-white"
      )}>
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-neutral-200">
          <h1 className="text-xl font-bold text-spice-brown">
            JaneChucks Admin
          </h1>
        </div>

        {/* If not logged in, show Login CTA and stop */}
        {!isLoggedIn ? (
          <div className="flex-1 p-4 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-neutral-600">You’re not signed in</p>
            <Button asChild className="w-full">
              <Link href="/admin/login">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          </div>
        ) : !isAdmin ? (
          // If logged-in but not admin, show friendly block
          <div className="flex-1 p-4 flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-neutral-600">Admin access required</p>
            <Button asChild variant="outline" className="w-full bg-transparent">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-6">
              {adminNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    )}>
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-neutral-200">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={async () => {
                  await signOut(); // << use provider signOut (updates context immediately)
                  window.dispatchEvent(new Event("auth:changed")); // notify anyone listening
                  router.push("/admin/login");
                }}>
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
