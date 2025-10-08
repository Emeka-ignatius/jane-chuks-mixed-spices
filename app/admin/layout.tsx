import type React from "react"
import { Inter } from "next/font/google"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"

const inter = Inter({ subsets: ["latin"] })

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`${inter.className} min-h-screen bg-neutral-50`}>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 lg:ml-64">
          <AdminHeader />
          <main className="p-4 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
