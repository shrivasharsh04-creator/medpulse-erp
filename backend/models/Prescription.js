const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    rxNumber: {
      type: String,
      required: true,
      unique: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
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
    patientAge: Number,
    patientGender: String,
    doctorName: {
      type: String,
      required: true,
    },
    doctorDepartment: {
      type: String,
      default: "General Medicine",
    },
    diagnosis: {
      type: String,
      required: true,
    },
    symptomsObserved: {
      type: String,
      default: "",
    },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g., "500 mg"
        frequency: { type: String, required: true }, // e.g., "1-0-1 (After meals)"
        duration: { type: String, required: true }, // e.g., "5 days"
        notes: { type: String, default: "" },
      },
    ],
    labTestsRecommended: {
      type: [String],
      default: [],
    },
    dietaryAdvice: {
      type: String,
      default: "Drink plenty of water and maintain adequate rest.",
    },
    followUpDate: {
      type: String,
      default: "In 7 Days",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
