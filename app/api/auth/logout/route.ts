import { type NextRequest, NextResponse } from "next/server"
import { logoutUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true })
    await logoutUser()
    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Logout failed" }, { status: 500 })
  }
}
