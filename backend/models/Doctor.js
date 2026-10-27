const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: ["Cardiology", "Neurology", "Orthopedics", "Pediatrics", "General Medicine", "Dermatology", "Oncology"],
      default: "General Medicine",
    },
    specialization: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      default: "MBBS, MD",
    },
    opdRoom: {
      type: String,
      default: "Room 102, Block A",
    },
    consultationFee: {
      type: Number,
      default: 800,
    },
    availableDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    },
    status: {
      type: String,
      enum: ["Available", "In Surgery", "On Leave"],
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
