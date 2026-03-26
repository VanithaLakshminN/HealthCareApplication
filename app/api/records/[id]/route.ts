import { connectDB } from "@/lib/mongodb";
import { MedicalRecord } from "@/models/MedicalRecord";
import { getUserFromToken } from "@/lib/authMiddleware";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const user = getUserFromToken();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  await MedicalRecord.findOneAndDelete({ _id: params.id, userId: user.userId });
  return NextResponse.json({ message: "Deleted" });
}
