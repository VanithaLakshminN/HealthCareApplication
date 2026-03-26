import { connectDB } from "@/lib/mongodb";
import { Hospital } from "@/models/Hospital";
import { getAdminFromToken } from "@/lib/authMiddleware";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const hospital = await Hospital.findById(params.id).lean();
  if (!hospital) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ hospital });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const admin = getAdminFromToken();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const hospital = await Hospital.findByIdAndUpdate(params.id, body, { new: true });
  return NextResponse.json({ hospital });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const admin = getAdminFromToken();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  await Hospital.findByIdAndDelete(params.id);
  return NextResponse.json({ message: "Deleted" });
}
