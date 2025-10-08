import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createUserAddress, getUserAddresses } from "@/lib/database";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rows = await getUserAddresses(user.id);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Map UI type → DB enum (home→shipping, office→billing)
  const type = body.type === "office" ? "billing" : "shipping";

  const created = await createUserAddress({
    userId: user.id,
    type,
    firstName: body.firstName,
    lastName: body.lastName,
    addressLine1: body.address,
    addressLine2: body.addressLine2 ?? "",
    city: body.city,
    state: body.state,
    postalCode: body.postalCode ?? "",
    country: body.country ?? "Nigeria",
    phone: body.phone,
    isDefault: !!body.isDefault,
  });

  return NextResponse.json(created, { status: 201 });
}
