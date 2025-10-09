import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Inter } from "next/font/google";
import type React from "react";

const inter = Inter({ subsets: ["latin"] });

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-neutral-50`}>
      <div className="md:flex">
        <AdminSidebar />
        <div className="flex-1">
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
