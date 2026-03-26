import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  dob: { type: String },
  bloodGroup: { type: String },
  address: { type: String },
  avatar: { type: String }, // URL
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

export const User = models.User || model("User", UserSchema);
