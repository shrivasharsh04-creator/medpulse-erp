const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
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
    items: [
      {
        description: { type: String, required: true },
        category: {
          type: String,
          enum: ["Consultation", "Pharmacy", "Laboratory", "Ward/Bed", "Procedure", "Miscellaneous"],
          default: "Consultation",
        },
        amount: { type: Number, required: true },
      },
    ],
    subtotal: {
      type: Number,
      required: true,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    balanceDue: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Partial", "Pending"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI / Online NetBanking", "Insurance TPA", "Pending"],
      default: "Pending",
    },
    paymentDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
