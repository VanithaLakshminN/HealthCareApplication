import { connectDB } from "@/lib/mongodb";
import { Pharmacy } from "@/models/Pharmacy";
import { getAdminFromToken } from "@/lib/authMiddleware";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const pharmacies = await Pharmacy.find({}).lean();
  return NextResponse.json({ pharmacies });
}

export async function POST(req: Request) {
  const admin = getAdminFromToken();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const pharmacy = await Pharmacy.create(body);
  return NextResponse.json({ pharmacy }, { status: 201 });
}
