const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { authenticateToken, authorizeRoles, JWT_SECRET } = require("./middleware/auth");

// Models
const User = require("./models/User");
const Patient = require("./models/Patient");
const Doctor = require("./models/Doctor");
const Appointment = require("./models/Appointment");
const Prescription = require("./models/Prescription");
const Bill = require("./models/Bill");
const Bed = require("./models/Bed");
const Medicine = require("./models/Medicine");

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/medpulseDB";

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log(`[MedPulse OS] Connected to MongoDB at ${MONGODB_URI}`))
  .catch((err) => console.error("[MedPulse OS] MongoDB Connection Error:", err));

// ==========================================
// 🏥 HEALTH & ROOT ENDPOINT
// ==========================================
app.get("/", (req, res) => {
  res.json({
    status: "active",
    platform: "MedPulse OS — Enterprise Healthcare ERP",
    version: "2.5.0",
    serverTime: new Date().toISOString(),
    clinicalModules: [
      "Patient Portal & EHR",
      "Doctor OPD Queue & Electronic Prescription (Rx)",
      "Hospital Bed & Ward Occupancy Management",
      "Pharmacy Inventory & Reorder Stock Alerts",
      "Consolidated Medical Billing & Instant Digital Receipts",
      "Executive Analytics & Multi-Department KPIs",
    ],
  });
});

// ==========================================
// 🔐 AUTHENTICATION & SESSIONS
// ==========================================

// Register New User
app.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role = "patient", phone, department } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists" });
    }

    const user = new User({ name, email, password, role, phone, department });
    await user.save();

    // Auto-create linked Patient profile if role is patient
    if (role === "patient") {
      const patient = new Patient({
        name,
        email,
        phone: phone || "+91 98000 11223",
        age: 28,
        gender: "Male",
        bloodGroup: "O+",
      });
      await patient.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Account registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register account" });
  }
});

// Login
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password credentials" });
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Authentication successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to login" });
  }
});

// Get Current User Session
app.get("/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User session not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user session" });
  }
});

// ==========================================
// 👤 PATIENT & EHR MODULE
// ==========================================

// Get All Patients (Admin & Doctor)
app.get("/patients", authenticateToken, authorizeRoles("admin", "doctor"), async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patients list" });
  }
});

// Get Logged-In Patient Record
app.get("/patients/me", authenticateToken, async (req, res) => {
  try {
    let patient = await Patient.findOne({ email: req.user.email });
    if (!patient) {
      const user = await User.findById(req.user.id);
      patient = new Patient({
        name: user ? user.name : "Registered Patient",
        email: req.user.email,
        phone: user?.phone || "+91 98111 00223",
        age: 32,
        gender: "Male",
        bloodGroup: "A+",
      });
      await patient.save();
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve patient health record" });
  }
});

// Update Patient Vitals (Nurse / Doctor / Patient)
app.put("/patients/:id/vitals", authenticateToken, async (req, res) => {
  try {
    const { bloodPressure, heartRate, spO2, temperature, weight } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    if (bloodPressure) patient.vitals.bloodPressure = bloodPressure;
    if (heartRate) patient.vitals.heartRate = Number(heartRate);
    if (spO2) patient.vitals.spO2 = Number(spO2);
    if (temperature) patient.vitals.temperature = temperature;
    if (weight) patient.vitals.weight = Number(weight);

    await patient.save();
    res.json({ message: "Vitals updated successfully", vitals: patient.vitals });
  } catch (err) {
    res.status(500).json({ error: "Failed to record vitals" });
  }
});

// ==========================================
// 🩺 DOCTORS & OPD QUEUE
// ==========================================

// List All Doctors
app.get("/doctors", async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ name: 1 });
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch doctors list" });
  }
});

// Doctor's Live OPD Queue
app.get("/doctors/opd-queue", authenticateToken, async (req, res) => {
  try {
    // If doctor logged in, show their queue; if admin, show all
    const filter = {};
    if (req.user.role === "doctor") {
      const user = await User.findById(req.user.id);
      filter.doctorName = { $regex: new RegExp(user.name.split(" ")[1] || user.name, "i") };
    }

    const appointments = await Appointment.find(filter).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to load OPD queue" });
  }
});

// ==========================================
// 📅 APPOINTMENTS MODULE
// ==========================================

// Get Appointments (with filters)
app.get("/appointments", authenticateToken, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "patient") {
      filter.patientEmail = req.user.email;
    }
    const appointments = await Appointment.find(filter).sort({ createdAt: -1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve appointments" });
  }
});

// Book New Appointment
app.post("/appointments/book", authenticateToken, async (req, res) => {
  try {
    const { doctorId, doctorName, department, appointmentDate, timeSlot, symptoms, patientPhone } = req.body;
    const user = await User.findById(req.user.id);

    const tokenCount = await Appointment.countDocuments({ appointmentDate });
    const tokenNumber = `T-${(tokenCount + 1).toString().padStart(2, "0")}`;

    const appointment = new Appointment({
      tokenNumber,
      patientName: user.name,
      patientEmail: user.email,
      patientPhone: patientPhone || user.phone || "+91 98765 43210",
      doctorId,
      doctorName: doctorName || "Dr. Rajesh Gupta",
      department: department || "General Medicine",
      appointmentDate: appointmentDate || new Date().toISOString().slice(0, 10),
      timeSlot: timeSlot || "10:30 AM",
      symptoms: symptoms || "Routine Clinical Consultation",
      status: "Waiting",
      consultationFee: 800,
      feeStatus: "Paid",
    });

    await appointment.save();

    // Auto-create Consultation Bill
    const bill = new Bill({
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      patientName: user.name,
      patientEmail: user.email,
      patientPhone: patientPhone || user.phone || "",
      items: [
        {
          description: `OPD Consultation with ${doctorName || "Dr. Rajesh Gupta"} (${department || "General Medicine"})`,
          category: "Consultation",
          amount: 800,
        },
      ],
      subtotal: 800,
      totalAmount: 800,
      paidAmount: 800,
      balanceDue: 0,
      paymentStatus: "Paid",
      paymentMethod: "UPI / Online NetBanking",
      paymentDate: new Date(),
    });
    await bill.save();

    res.status(201).json({
      message: `Appointment booked successfully! Your Token is ${tokenNumber}`,
      appointment,
      bill,
    });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Failed to book appointment" });
  }
});

// Update Appointment Status (Doctor / Admin)
app.put("/appointments/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json({ message: `Status updated to ${status}`, appointment });
  } catch (err) {
    res.status(500).json({ error: "Failed to update appointment status" });
  }
});

// ==========================================
// 💊 PRESCRIPTIONS & ELECTRONIC HEALTH RECORD
// ==========================================

// Get Prescriptions for Logged-In Patient
app.get("/prescriptions/my-records", authenticateToken, async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientEmail: req.user.email }).sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch prescriptions" });
  }
});

// List All Prescriptions (Doctor / Admin)
app.get("/prescriptions", authenticateToken, authorizeRoles("admin", "doctor"), async (req, res) => {
  try {
    const prescriptions = await Prescription.find().sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve prescriptions" });
  }
});

// Generate Electronic Prescription (Doctor)
app.post("/prescriptions/create", authenticateToken, authorizeRoles("admin", "doctor"), async (req, res) => {
  try {
    const {
      appointmentId,
      patientName,
      patientEmail,
      patientAge,
      patientGender,
      doctorName,
      doctorDepartment,
      diagnosis,
      symptomsObserved,
      medicines,
      labTestsRecommended,
      dietaryAdvice,
      followUpDate,
    } = req.body;

    const rxNumber = `RX-${Date.now().toString().slice(-6)}`;

    const prescription = new Prescription({
      rxNumber,
      appointmentId,
      patientName,
      patientEmail,
      patientAge: patientAge || 30,
      patientGender: patientGender || "Male",
      doctorName: doctorName || req.user.name,
      doctorDepartment: doctorDepartment || "General Medicine",
      diagnosis,
      symptomsObserved,
      medicines: medicines || [],
      labTestsRecommended: labTestsRecommended || [],
      dietaryAdvice: dietaryAdvice || "Adequate hydration, warm fluid intake, and 7-8 hours sleep.",
      followUpDate: followUpDate || "7 Days",
    });

    await prescription.save();

    // If linked to an appointment, mark it Completed
    if (appointmentId) {
      await Appointment.findByIdAndUpdate(appointmentId, { status: "Completed" });
    }

    res.status(201).json({
      message: `Prescription ${rxNumber} generated successfully!`,
      prescription,
    });
  } catch (err) {
    console.error("Prescription error:", err);
    res.status(500).json({ error: "Failed to generate prescription" });
  }
});

// ==========================================
// 💳 MEDICAL INVOICING & BILLING LEDGER
// ==========================================

// Get Bills (Patient sees own, Admin sees all)
app.get("/bills", authenticateToken, async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "patient") {
      filter.patientEmail = req.user.email;
    }
    const bills = await Bill.find(filter).sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// Pay Bill Online (Instant Settlement)
app.post("/bills/:id/pay", authenticateToken, async (req, res) => {
  try {
    const { amount, paymentMethod = "UPI / Online NetBanking" } = req.body;
    const bill = await Bill.findById(req.params.id);
    if (!bill) return res.status(404).json({ error: "Invoice not found" });

    const payAmt = Number(amount) || bill.balanceDue;
    if (payAmt <= 0) return res.status(400).json({ error: "Invalid payment amount" });

    bill.paidAmount = bill.paidAmount + payAmt;
    bill.balanceDue = Math.max(0, bill.totalAmount - bill.paidAmount);
    bill.paymentStatus = bill.balanceDue === 0 ? "Paid" : "Partial";
    bill.paymentMethod = paymentMethod;
    bill.paymentDate = new Date();

    await bill.save();

    res.json({
      message: `Payment of ₹${payAmt.toLocaleString()} cleared successfully!`,
      bill,
      receipt: {
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
        invoiceNumber: bill.invoiceNumber,
        patientName: bill.patientName,
        amountPaidNow: payAmt,
        totalPaid: bill.paidAmount,
        balanceRemaining: bill.balanceDue,
        status: bill.paymentStatus,
        date: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to process bill payment" });
  }
});

// ==========================================
// 🛏️ BED & WARD OCCUPANCY MODULE
// ==========================================

// List All Beds
app.get("/beds", authenticateToken, async (req, res) => {
  try {
    const beds = await Bed.find().sort({ bedNumber: 1 });
    res.json(beds);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch beds status" });
  }
});

// Allocate Bed to Patient (Admin / Nurse)
app.put("/beds/:id/allocate", authenticateToken, authorizeRoles("admin", "doctor"), async (req, res) => {
  try {
    const { patientName, patientEmail, admittingDoctor } = req.body;
    const bed = await Bed.findById(req.params.id);
    if (!bed) return res.status(404).json({ error: "Bed not found" });

    if (bed.isOccupied) {
      return res.status(400).json({ error: `Bed ${bed.bedNumber} is already occupied` });
    }

    bed.isOccupied = true;
    bed.occupiedBy = {
      patientName,
      patientEmail,
      admissionDate: new Date(),
      admittingDoctor: admittingDoctor || "Attending Physician",
    };
    await bed.save();

    // Update patient status to Inpatient
    if (patientEmail) {
      await Patient.findOneAndUpdate(
        { email: patientEmail },
        { admissionStatus: "Admitted Inpatient", allocatedBed: bed.bedNumber }
      );
    }

    res.json({ message: `Bed ${bed.bedNumber} allocated to ${patientName}`, bed });
  } catch (err) {
    res.status(500).json({ error: "Failed to allocate bed" });
  }
});

// Discharge Patient & Free Bed
app.put("/beds/:id/discharge", authenticateToken, authorizeRoles("admin", "doctor"), async (req, res) => {
  try {
    const bed = await Bed.findById(req.params.id);
    if (!bed) return res.status(404).json({ error: "Bed not found" });

    const patientEmail = bed.occupiedBy?.patientEmail;
    bed.isOccupied = false;
    bed.occupiedBy = { patientName: null, patientEmail: null, admissionDate: null, admittingDoctor: null };
    await bed.save();

    if (patientEmail) {
      await Patient.findOneAndUpdate(
        { email: patientEmail },
        { admissionStatus: "Discharged", allocatedBed: null }
      );
    }

    res.json({ message: `Bed ${bed.bedNumber} is now free and sanitized`, bed });
  } catch (err) {
    res.status(500).json({ error: "Failed to discharge patient" });
  }
});

// ==========================================
// 💊 PHARMACY & MEDICINE INVENTORY
// ==========================================

// Get All Medicines
app.get("/medicines", async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ stockUnits: 1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pharmacy inventory" });
  }
});

// Get Low-Stock Alerts
app.get("/medicines/alerts", async (req, res) => {
  try {
    const lowStock = await Medicine.find({ $expr: { $lte: ["$stockUnits", "$reorderThreshold"] } });
    res.json(lowStock);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stock alerts" });
  }
});

// ==========================================
// 📊 HOSPITAL EXECUTIVE OVERVIEW & KPI ANALYTICS
// ==========================================
app.get("/analytics/hospital-overview", authenticateToken, async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: "Waiting" });
    
    // Beds calculation
    const totalBeds = await Bed.countDocuments();
    const occupiedBeds = await Bed.countDocuments({ isOccupied: true });
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Financial calculations
    const bills = await Bill.find();
    const totalRevenue = bills.reduce((acc, b) => acc + (b.paidAmount || 0), 0);
    const pendingDues = bills.reduce((acc, b) => acc + (b.balanceDue || 0), 0);

    // Pharmacy alerts
    const lowStockCount = await Medicine.countDocuments({
      $expr: { $lte: ["$stockUnits", "$reorderThreshold"] },
    });

    res.json({
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      totalBeds,
      occupiedBeds,
      occupancyRate,
      totalRevenue,
      pendingDues,
      lowStockCount,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate hospital analytics" });
  }
});

// ==========================================
// 🚀 DEMO DATA SEEDING (One-Click Setup)
// ==========================================
app.post("/system/seed-all", async (req, res) => {
  try {
    // 1. Seed Auth Users
    const users = [
      { name: "Dr. Arvind Mehra (Chief Admin)", email: "admin@hospital.com", password: "admin123", role: "admin", department: "Hospital Administration", phone: "+91 98111 11222" },
      { name: "Dr. Priya Nair (Cardiologist)", email: "doctor@hospital.com", password: "doctor123", role: "doctor", department: "Cardiology", phone: "+91 98222 22333" },
      { name: "Rohan Verma (Patient)", email: "patient@hospital.com", password: "patient123", role: "patient", department: "OPD", phone: "+91 98333 33444" },
    ];

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const newUser = new User(u);
        await newUser.save();
      }
    }

    // 2. Seed Doctors
    await Doctor.deleteMany({});
    await Doctor.insertMany([
      { name: "Dr. Priya Nair", email: "doctor@hospital.com", phone: "+91 98222 22333", department: "Cardiology", specialization: "Interventional Cardiology", qualification: "MBBS, MD, DM (Cardio)", opdRoom: "OPD 104, Heart Wing", consultationFee: 1000 },
      { name: "Dr. Rajesh Gupta", email: "rajesh.gupta@hospital.com", phone: "+91 98333 55444", department: "General Medicine", specialization: "Internal Medicine & Diabetes", qualification: "MBBS, MD", opdRoom: "OPD 101, Main Block", consultationFee: 700 },
      { name: "Dr. Sunita Rao", email: "sunita.rao@hospital.com", phone: "+91 98444 66555", department: "Orthopedics", specialization: "Joint Replacement & Trauma", qualification: "MBBS, MS (Ortho)", opdRoom: "OPD 205, Surgical Wing", consultationFee: 900 },
      { name: "Dr. Sameer Deshmukh", email: "sameer.d@hospital.com", phone: "+91 98555 77666", department: "Neurology", specialization: "Stroke & Neurovascular", qualification: "MBBS, DM (Neuro)", opdRoom: "OPD 302, Neuro Centre", consultationFee: 1200 },
    ]);

    // 3. Seed Patients
    await Patient.deleteMany({});
    await Patient.insertMany([
      { name: "Rohan Verma", email: "patient@hospital.com", phone: "+91 98333 33444", age: 34, gender: "Male", bloodGroup: "O+", vitals: { bloodPressure: "125/82 mmHg", heartRate: 74, spO2: 99, temperature: "98.4 °F", weight: 72 }, allergies: ["Penicillin"], chronicConditions: ["Mild Hypertension"] },
      { name: "Kavita Sharma", email: "kavita.s@gmail.com", phone: "+91 98123 45678", age: 48, gender: "Female", bloodGroup: "B+", vitals: { bloodPressure: "138/88 mmHg", heartRate: 80, spO2: 97, temperature: "99.1 °F", weight: 64 }, allergies: ["None"], chronicConditions: ["Type 2 Diabetes"] },
      { name: "Amitabh Sen", email: "amitabh.sen@outlook.com", phone: "+91 98234 56789", age: 62, gender: "Male", bloodGroup: "AB+", vitals: { bloodPressure: "130/85 mmHg", heartRate: 68, spO2: 98, temperature: "98.6 °F", weight: 78 }, allergies: ["Sulfa drugs"], chronicConditions: ["Coronary Artery Disease"] },
    ]);

    // 4. Seed Appointments
    await Appointment.deleteMany({});
    await Appointment.insertMany([
      { tokenNumber: "T-01", patientName: "Rohan Verma", patientEmail: "patient@hospital.com", patientPhone: "+91 98333 33444", doctorName: "Dr. Priya Nair", department: "Cardiology", appointmentDate: new Date().toISOString().slice(0, 10), timeSlot: "10:00 AM", symptoms: "Mild chest heaviness during exertion", status: "In Consultation", consultationFee: 1000, feeStatus: "Paid" },
      { tokenNumber: "T-02", patientName: "Kavita Sharma", patientEmail: "kavita.s@gmail.com", patientPhone: "+91 98123 45678", doctorName: "Dr. Rajesh Gupta", department: "General Medicine", appointmentDate: new Date().toISOString().slice(0, 10), timeSlot: "10:30 AM", symptoms: "Flu-like fever and body ache", status: "Waiting", consultationFee: 700, feeStatus: "Paid" },
      { tokenNumber: "T-03", patientName: "Amitabh Sen", patientEmail: "amitabh.sen@outlook.com", patientPhone: "+91 98234 56789", doctorName: "Dr. Priya Nair", department: "Cardiology", appointmentDate: new Date().toISOString().slice(0, 10), timeSlot: "11:15 AM", symptoms: "Quarterly Post-Angioplasty Checkup", status: "Waiting", consultationFee: 1000, feeStatus: "Paid" },
    ]);

    // 5. Seed Beds
    await Bed.deleteMany({});
    await Bed.insertMany([
      { bedNumber: "ICU-01", wardType: "Intensive Care Unit (ICU)", floor: "2nd Floor, Wing A", dailyCharge: 6000, isOccupied: true, occupiedBy: { patientName: "Vikram Malhotra", patientEmail: "vikram@gmail.com", admissionDate: new Date(), admittingDoctor: "Dr. Priya Nair" } },
      { bedNumber: "ICU-02", wardType: "Intensive Care Unit (ICU)", floor: "2nd Floor, Wing A", dailyCharge: 6000, isOccupied: false },
      { bedNumber: "GEN-101", wardType: "General Ward", floor: "1st Floor, Wing C", dailyCharge: 1200, isOccupied: true, occupiedBy: { patientName: "Sanjay Dixit", patientEmail: "sanjay@gmail.com", admissionDate: new Date(), admittingDoctor: "Dr. Rajesh Gupta" } },
      { bedNumber: "GEN-102", wardType: "General Ward", floor: "1st Floor, Wing C", dailyCharge: 1200, isOccupied: false },
      { bedNumber: "PVT-201", wardType: "Private Deluxe Suite", floor: "3rd Floor, Wing A", dailyCharge: 3800, isOccupied: false },
      { bedNumber: "EMR-01", wardType: "Emergency Trauma", floor: "Ground Floor", dailyCharge: 2500, isOccupied: false },
    ]);

    // 6. Seed Medicines
    await Medicine.deleteMany({});
    await Medicine.insertMany([
      { name: "Amoxicillin 500mg", category: "Antibiotic", stockUnits: 140, reorderThreshold: 30, unitPrice: 12, manufacturer: "SunPharma" },
      { name: "Paracetamol 650mg (Dolo)", category: "Antipyretic", stockUnits: 25, reorderThreshold: 50, unitPrice: 3, manufacturer: "Micro Labs" }, // Low stock!
      { name: "Atorvastatin 20mg", category: "Cardiovascular", stockUnits: 90, reorderThreshold: 20, unitPrice: 18, manufacturer: "Cipla" },
      { name: "Aspirin 75mg (Ecosprin)", category: "Cardiovascular", stockUnits: 18, reorderThreshold: 25, unitPrice: 4, manufacturer: "USV" }, // Low stock!
      { name: "Pantoprazole 40mg", category: "Analgesic & Pain Relief", stockUnits: 120, reorderThreshold: 30, unitPrice: 9, manufacturer: "Alkem" },
      { name: "Azithromycin 500mg", category: "Antibiotic", stockUnits: 65, reorderThreshold: 20, unitPrice: 22, manufacturer: "Lupin" },
    ]);

    // 7. Seed Prescriptions
    await Prescription.deleteMany({});
    await Prescription.insertMany([
      {
        rxNumber: "RX-491024",
        patientName: "Rohan Verma",
        patientEmail: "patient@hospital.com",
        patientAge: 34,
        patientGender: "Male",
        doctorName: "Dr. Priya Nair",
        doctorDepartment: "Cardiology",
        diagnosis: "Atypical Chest Wall Pain & Mild Dyslipidemia",
        symptomsObserved: "Exertional tightness, normal resting ECG",
        medicines: [
          { name: "Atorvastatin 20mg", dosage: "20 mg", frequency: "0-0-1 (Night after food)", duration: "30 Days", notes: "Lowers cholesterol" },
          { name: "Aspirin 75mg", dosage: "75 mg", frequency: "1-0-0 (Morning after breakfast)", duration: "30 Days", notes: "Blood thinner" },
          { name: "Pantoprazole 40mg", dosage: "40 mg", frequency: "1-0-0 (Empty stomach 30 mins before breakfast)", duration: "14 Days", notes: "Antacid" },
        ],
        labTestsRecommended: ["Lipid Profile (12 hrs fasting)", "Treadmill Stress Test (TMT)"],
        dietaryAdvice: "Low sodium, avoid saturated trans fats, 30 minutes daily brisk walk.",
        followUpDate: "Review with reports in 2 Weeks",
      },
    ]);

    // 8. Seed Bills
    await Bill.deleteMany({});
    await Bill.insertMany([
      {
        invoiceNumber: "INV-782190",
        patientName: "Rohan Verma",
        patientEmail: "patient@hospital.com",
        patientPhone: "+91 98333 33444",
        items: [
          { description: "Specialist Cardiology Consultation (Dr. Priya Nair)", category: "Consultation", amount: 1000 },
          { description: "Standard 12-Lead Electrocardiogram (ECG)", category: "Laboratory", amount: 450 },
        ],
        subtotal: 1450,
        totalAmount: 1450,
        paidAmount: 1450,
        balanceDue: 0,
        paymentStatus: "Paid",
        paymentMethod: "UPI / Online NetBanking",
        paymentDate: new Date(),
      },
      {
        invoiceNumber: "INV-849103",
        patientName: "Rohan Verma",
        patientEmail: "patient@hospital.com",
        patientPhone: "+91 98333 33444",
        items: [
          { description: "Pharmacy: Atorvastatin (30 tabs) + Aspirin (30 tabs)", category: "Pharmacy", amount: 660 },
          { description: "Lipid Profile Fasting Blood Test", category: "Laboratory", amount: 800 },
        ],
        subtotal: 1460,
        totalAmount: 1460,
        paidAmount: 660,
        balanceDue: 800,
        paymentStatus: "Partial",
        paymentMethod: "Cash",
        paymentDate: new Date(),
      },
    ]);

    res.json({
      message: "MedPulse OS Hospital Demo Dataset Seeded Successfully!",
      accounts: [
        { role: "Admin", email: "admin@hospital.com", password: "admin123" },
        { role: "Doctor", email: "doctor@hospital.com", password: "doctor123" },
        { role: "Patient", email: "patient@hospital.com", password: "patient123" },
      ],
    });
  } catch (err) {
    console.error("Seeding error:", err);
    res.status(500).json({ error: "Failed to seed demo hospital data" });
  }
});

// ==========================================
// 🚀 SERVER STARTUP
// ==========================================
const server = app.listen(PORT, () => {
  console.log(`[MedPulse OS] Server listening on port ${PORT}`);
  console.log(`[MedPulse OS] API Gateway: http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[MedPulse OS] Port ${PORT} already in use. Try freeing port or running on PORT=5002`);
  } else {
    console.error("[MedPulse OS] Server error:", err);
  }
});
