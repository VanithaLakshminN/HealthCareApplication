import mongoose, { Schema, model, models } from "mongoose";

const AppointmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  hospitalId: { type: String, required: true },
  hospitalName: { type: String, required: true },
  doctorName: { type: String, required: true },
  doctorSpecialty: { type: String },
  date: { type: String, required: true },
  slot: { type: String, required: true },
  type: { type: String, enum: ["in-person", "video"], default: "in-person" },
  status: { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming" },
  notes: { type: String },
}, { timestamps: true });

export const Appointment = models.Appointment || model("Appointment", AppointmentSchema);
