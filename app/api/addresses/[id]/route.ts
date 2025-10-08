import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateUserAddress, deleteUserAddress } from "@/lib/database";

export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await _req.json();

  // If toggling default, unset others of the same type for this user
  if (body.isDefault === true) {
    const current = await db.userAddress.findUnique({
      where: { id: params.id },
    });
    if (!current || current.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await db.userAddress.updateMany({
      where: { userId: user.id, type: current.type },
      data: { isDefault: false },
    });
  }

  const updated = await updateUserAddress(params.id, {
    firstName: body.firstName,
    lastName: body.lastName,
    addressLine1: body.address,
    addressLine2: body.addressLine2,
    city: body.city,
    state: body.state,
    postalCode: body.postalCode,
    country: body.country,
    phone: body.phone,
    isDefault: body.isDefault,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Optional: ensure the address belongs to the current user
  const addr = await db.userAddress.findUnique({ where: { id: params.id } });
  if (!addr || addr.userId !== user.id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteUserAddress(params.id);
  return NextResponse.json({ ok: true });
}
