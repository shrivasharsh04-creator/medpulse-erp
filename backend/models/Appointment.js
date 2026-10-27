const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    tokenNumber: {
      type: String,
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: false,
    },
    patientName: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      required: true,
    },
    patientPhone: {
      type: String,
      default: "",
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: false,
    },
    doctorName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    appointmentDate: {
      type: String,
      required: true, // YYYY-MM-DD
    },
    timeSlot: {
      type: String,
      required: true, // e.g. "10:30 AM"
    },
    symptoms: {
      type: String,
      default: "General Checkup",
    },
    status: {
      type: String,
      enum: ["Scheduled", "Waiting", "In Consultation", "Completed", "Cancelled"],
      default: "Waiting",
    },
    consultationFee: {
      type: Number,
      default: 800,
    },
    feeStatus: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Paid",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
