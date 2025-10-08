import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { SignupForm } from "@/components/auth/signup-form"

export const dynamic = "force-dynamic"

export default async function SignupPage() {
  const user = await getCurrentUser()

  if (user) {
    redirect("/profile")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <SignupForm />
    </div>
  )
}

export const metadata = {
  title: "Sign Up - JaneChucks Mixed Spices",
  description: "Create your account to start shopping for premium spice blends",
}
