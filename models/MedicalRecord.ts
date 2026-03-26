import mongoose, { Schema, model, models } from "mongoose";

const MedicalRecordSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["prescription", "xray", "scan", "lab", "discharge", "other"], required: true },
  title: { type: String, required: true },
  doctor: { type: String },
  hospital: { type: String },
  date: { type: String, required: true },
  notes: { type: String },
  fileUrl: { type: String }, // Cloudinary or base64
  fileName: { type: String },
}, { timestamps: true });

export const MedicalRecord = models.MedicalRecord || model("MedicalRecord", MedicalRecordSchema);
