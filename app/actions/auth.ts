"use server";

import { redirect } from "next/navigation";
import { loginUser, registerUser, logoutUser } from "@/lib/auth";
import { getUserByEmail } from "@/lib/database";
import { sendPasswordResetEmail as sendResetEmail } from "@/lib/email";
import crypto from "crypto";
import { hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    const result = await loginUser(email.toLowerCase().trim(), password);
    return result;
  } catch (error) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during login",
    };
  }
}

export async function signupAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    if (!name || !email || !password) {
      return {
        success: false,
        error: "Name, email, and password are required",
      };
    }

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters long",
      };
    }

    if (name.trim().length < 2) {
      return {
        success: false,
        error: "Name must be at least 2 characters long",
      };
    }

    // Phone validation (optional)
    if (phone && phone.trim() && !/^[+]?[\d\s\-()]{10,}$/.test(phone.trim())) {
      return { success: false, error: "Please enter a valid phone number" };
    }

    const result = await registerUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || undefined,
      password,
    });

    return result;
  } catch (error) {
    console.error("Signup action error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during registration",
    };
  }
}

export async function logoutAction() {
  try {
    await logoutUser();
  } catch (error) {
    console.error("Logout action error:", error);
  }
  redirect("/");
}

export async function loginAdmin(email: string, password: string) {
  try {
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    const result = await loginUser(email.toLowerCase().trim(), password);

    // Check if user is admin
    if (result.success && result.user && !result.user.isAdmin) {
      return {
        success: false,
        error: "Access denied. Admin privileges required.",
      };
    }

    return result;
  } catch (error) {
    console.error("Admin login error:", error);
    return {
      success: false,
      error: "An unexpected error occurred during login",
    };
  }
}

export async function sendPasswordResetEmail(email: string) {
  try {
    if (!email) {
      return { success: false, error: "Email is required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: "Please enter a valid email address" };
    }

    const user = await getUserByEmail(email.toLowerCase().trim());

    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return {
        success: true,
        message:
          "If an account exists with this email, you will receive a password reset link.",
      };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    await sendResetEmail(user.email, user.name || "User", resetUrl);

    return {
      success: true,
      message: "Password reset email sent successfully",
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      error: "An error occurred while processing your request",
    };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    if (!token || !newPassword) {
      return { success: false, error: "Token and new password are required" };
    }

    if (newPassword.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters long",
      };
    }

    // Find user with valid reset token
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return { success: false, error: "Invalid or expired reset token" };
    }

    // Hash new password and update user
    const hashedPassword = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return {
      success: true,
      message: "Password reset successfully",
    };
  } catch (error) {
    console.error("Reset password error:", error);
    return {
      success: false,
      error: "An error occurred while resetting your password",
    };
  }
}
