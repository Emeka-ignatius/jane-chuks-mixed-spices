import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { getUserByEmail, createUser, getUserById } from "@/lib/database";
import { UserRole } from "@prisma/client";

// Provide a fallback for development, but warn about it
const JWT_SECRET =
  process.env.JWT_SECRET ||
  (() => {
    console.warn(
      "⚠️  JWT_SECRET environment variable is not set. Using fallback for development."
    );
    return "development-fallback-secret-please-set-jwt-secret-in-production";
  })();

const JWT_EXPIRES_IN = "1d";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  isAdmin: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  if (!user || !user.id || !user.email) {
    throw new Error("Invalid user data for token generation");
  }

  const payload = {
    id: user.id,
    email: user.email,
    name: user.name || null,
    phone: user.phone || null,
    isAdmin: Boolean(user.isAdmin),
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: "HS256",
  });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    if (!token || typeof token !== "string") {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    }) as any;

    // Validate decoded token structure
    if (
      !decoded ||
      typeof decoded !== "object" ||
      !decoded.id ||
      !decoded.email
    ) {
      return null;
    }

    return {
      id: String(decoded.id),
      email: String(decoded.email),
      name: decoded.name || undefined,
      phone: decoded.phone || undefined,
      isAdmin: Boolean(decoded.isAdmin),
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

export async function setAuthCookie(user: AuthUser) {
  try {
    const token = generateToken(user);
    const cookieStore = await cookies();

    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 1, // 7 days
      path: "/",
    });
  } catch (error) {
    console.error("Error setting auth cookie:", error);
    throw error;
  }
}

export async function removeAuthCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth-token");
  } catch (error) {
    console.error("Error removing auth cookie:", error);
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    // Verify user still exists in database
    const user = await getUserById(decoded.id);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name!,
      phone: user.phone!,
      isAdmin: user.isAdmin,
    };
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    console.log(" Login attempt for email:", email);
    const user = await getUserByEmail(email);

    if (!user) {
      console.log(" User not found");
      return { success: false, error: "Invalid email or password" };
    }

    console.log(" User found, verifying password");
    const isValidPassword = await verifyPassword(
      password,
      user.passwordHash || ""
    );

    if (!isValidPassword) {
      console.log(" Invalid password");
      return { success: false, error: "Invalid email or password" };
    }

    console.log(" Password valid, creating auth user");
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      phone: user.phone || undefined,
      isAdmin: user.isAdmin,
    };

    console.log(" Setting auth cookie");
    await setAuthCookie(authUser);
    console.log(" Login successful");
    return { success: true, user: authUser };
  } catch (error) {
    console.error(" Login error:", error);
    return { success: false, error: "An error occurred during login" };
  }
}

export async function registerUser(userData: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const newUser = await createUser({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      passwordHash: hashedPassword,
    });

    const authUser: AuthUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name || undefined,
      phone: newUser.phone || undefined,
      isAdmin: newUser.isAdmin,
    };

    await setAuthCookie(authUser);
    return { success: true, user: authUser };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "An error occurred during registration" };
  }
}

export async function logoutUser(): Promise<void> {
  await removeAuthCookie();
}
