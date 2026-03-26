import { connectDB } from "@/lib/mongodb";
import { Pharmacy } from "@/models/Pharmacy";
import { getAdminFromToken } from "@/lib/authMiddleware";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const admin = getAdminFromToken();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const pharmacy = await Pharmacy.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json({ pharmacy });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const admin = getAdminFromToken();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  await Pharmacy.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Deleted" });
}
