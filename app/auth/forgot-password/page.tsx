import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-spice-orange/10 via-white to-spice-green/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Forgot Password
          </h1>
          <p className="text-muted-foreground">
            We'll send you a reset link to your email
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}

export const metadata = {
  title: "Forgot Password - JaneChuks Mixed Spices",
  description: "Reset your password",
};
