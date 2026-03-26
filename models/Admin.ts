import { Schema, model, models } from "mongoose";

const AdminSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" }, // "superadmin" | "admin"
}, { timestamps: true });

export const Admin = models.Admin || model("Admin", AdminSchema);
