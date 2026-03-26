import { connectDB } from "@/lib/mongodb";
import { MedicalRecord } from "@/models/MedicalRecord";
import { getUserFromToken } from "@/lib/authMiddleware";
import { NextResponse } from "next/server";

export async function GET() {
  const user = getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const records = await MedicalRecord.find({ userId: user.userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ records });
}

export async function POST(req: Request) {
  const user = getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const record = await MedicalRecord.create({ ...body, userId: user.userId });
  return NextResponse.json({ record }, { status: 201 });
}
