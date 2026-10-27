const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema(
  {
    bedNumber: {
      type: String,
      required: true,
      unique: true, // e.g. "ICU-01", "GEN-104", "PVT-201"
    },
    wardType: {
      type: String,
      enum: ["Intensive Care Unit (ICU)", "General Ward", "Private Deluxe Suite", "Emergency Trauma"],
      required: true,
    },
    floor: {
      type: String,
      default: "1st Floor, Wing B",
    },
    dailyCharge: {
      type: Number,
      required: true,
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
    occupiedBy: {
      patientName: { type: String, default: null },
      patientEmail: { type: String, default: null },
      admissionDate: { type: Date, default: null },
      admittingDoctor: { type: String, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bed", bedSchema);
