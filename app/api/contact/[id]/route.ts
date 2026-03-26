import { connectDB } from "@/lib/mongodb";
import { Contact } from "@/models/Contact";
import { getAdminFromToken } from "@/lib/authMiddleware";
import { NextResponse } from "next/server";

// Admin replies to a query
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const admin = getAdminFromToken();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const { adminReply, status } = await req.json();
  const contact = await Contact.findByIdAndUpdate(
    params.id,
    { adminReply, status: status || "addressed", repliedAt: new Date() },
    { new: true }
  );
  return NextResponse.json({ contact });
}
