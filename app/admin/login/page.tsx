import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-spice-orange/10 via-white to-spice-green/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-spice-brown mb-2">
            Admin Portal
          </h1>
          <p className="text-neutral-600">JaneChuks Mixed Spices</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
