const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: ["Antibiotic", "Analgesic & Pain Relief", "Antipyretic", "Cardiovascular", "Respiratory", "Vitamins & Supplements", "Injectable"],
      required: true,
    },
    genericFormula: {
      type: String,
      default: "",
    },
    stockUnits: {
      type: Number,
      required: true,
      min: 0,
    },
    reorderThreshold: {
      type: Number,
      default: 30, // Warn when stock drops below this
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    manufacturer: {
      type: String,
      default: "MedPharma Labs",
    },
    batchNumber: {
      type: String,
      default: "MED-2026-B1",
    },
    expiryDate: {
      type: String,
      default: "2027-12-31",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Medicine", medicineSchema);
