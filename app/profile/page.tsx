import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ProfileContent } from "@/components/profile/profile-content";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen">
      <ProfileContent user={user} />
    </div>
  );
}

export const metadata = {
  title: "My Profile - JaneChuks Mixed Spices",
  description: "Manage your account, orders, and preferences",
};
