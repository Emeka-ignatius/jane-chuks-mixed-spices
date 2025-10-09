"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "VISITOR" | "CUSTOMER" | "ADMIN";
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const handler = () => refresh();
    window.addEventListener("auth:changed", handler);
    window.addEventListener("focus", handler);
    return () => {
      window.removeEventListener("auth:changed", handler);
      window.removeEventListener("focus", handler);
    };
  }, [refresh]);

  console.log("AuthProvider user:", { user });

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
      window.dispatchEvent(new Event("auth:changed"));
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Compatibility with Stack Auth's useUser hook
export function useUser() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return {
    id: user.id,
    displayName: user.name,
    primaryEmail: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
    phone: user.phone,
    signOut,
  };
}
