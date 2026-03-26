import { Schema, model, models } from "mongoose";

const ContactSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["pending", "addressed", "closed"], default: "pending" },
  adminReply: { type: String },
  repliedAt: { type: Date },
}, { timestamps: true });

export const Contact = models.Contact || model("Contact", ContactSchema);
