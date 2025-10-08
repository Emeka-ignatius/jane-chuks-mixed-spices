import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { Suspense } from "react";
import { AuthProvider } from "@/components/auth/auth-provider";

export const metadata: Metadata = {
  title: "JaneChuks Mixed Spices - Premium Natural Spice Blends",
  description:
    "Discover premium mixed spices crafted for men, women, and multipurpose use. Natural ingredients for enhanced nutrition and wellness.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <Navigation />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </Suspense>
          <Toaster position="bottom-right" />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
