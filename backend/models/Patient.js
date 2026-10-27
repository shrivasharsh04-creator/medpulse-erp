const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
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
    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      default: "O+",
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    vitals: {
      bloodPressure: { type: String, default: "120/80 mmHg" },
      heartRate: { type: Number, default: 72 },
      spO2: { type: Number, default: 98 },
      temperature: { type: String, default: "98.6 °F" },
      weight: { type: Number, default: 68 }, // in kg
    },
    allergies: {
      type: [String],
      default: ["None reported"],
    },
    chronicConditions: {
      type: [String],
      default: [],
    },
    admissionStatus: {
      type: String,
      enum: ["OPD Outpatient", "Admitted Inpatient", "Discharged"],
      default: "OPD Outpatient",
    },
    allocatedBed: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
