import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medpulse_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired token
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403 && error.response.data?.error?.includes('expired')) {
      clearAuthSession();
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// ==========================================
// 🔐 AUTH & SESSION HELPERS
// ==========================================
export const loginUser = async (credentials) => {
  const res = await apiClient.post('/auth/login', credentials);
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await apiClient.post('/auth/register', userData);
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await apiClient.get('/auth/me');
  return res.data;
};

export const setAuthSession = (token, user) => {
  localStorage.setItem('medpulse_token', token);
  localStorage.setItem('medpulse_user', JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem('medpulse_token');
  localStorage.removeItem('medpulse_user');
};

export const getStoredAuth = () => {
  const token = localStorage.getItem('medpulse_token');
  const userJson = localStorage.getItem('medpulse_user');
  try {
    const user = userJson ? JSON.parse(userJson) : null;
    return { token, user };
  } catch (e) {
    return { token: null, user: null };
  }
};

// ==========================================
// 📅 APPOINTMENTS & OPD QUEUE
// ==========================================
export const getAppointments = async () => {
  const res = await apiClient.get('/appointments');
  return res.data;
};

export const bookAppointment = async (bookingData) => {
  const res = await apiClient.post('/appointments/book', bookingData);
  return res.data;
};

export const updateAppointmentStatus = async (id, status) => {
  const res = await apiClient.put(`/appointments/${id}/status`, { status });
  return res.data;
};

export const getDoctorOpdQueue = async () => {
  const res = await apiClient.get('/doctors/opd-queue');
  return res.data;
};

export const getDoctors = async () => {
  const res = await apiClient.get('/doctors');
  return res.data;
};

// ==========================================
// 👤 PATIENTS & VITALS
// ==========================================
export const getMyPatientRecord = async () => {
  const res = await apiClient.get('/patients/me');
  return res.data;
};

export const getAllPatients = async () => {
  const res = await apiClient.get('/patients');
  return res.data;
};

export const updatePatientVitals = async (id, vitalsData) => {
  const res = await apiClient.put(`/patients/${id}/vitals`, vitalsData);
  return res.data;
};

// ==========================================
// 💊 PRESCRIPTIONS (EHR)
// ==========================================
export const getMyPrescriptions = async () => {
  const res = await apiClient.get('/prescriptions/my-records');
  return res.data;
};

export const getAllPrescriptions = async () => {
  const res = await apiClient.get('/prescriptions');
  return res.data;
};

export const createPrescription = async (prescriptionData) => {
  const res = await apiClient.post('/prescriptions/create', prescriptionData);
  return res.data;
};

// ==========================================
// 💳 BILLING & INVOICING
// ==========================================
export const getBills = async () => {
  const res = await apiClient.get('/bills');
  return res.data;
};

export const payBill = async (id, amount, paymentMethod) => {
  const res = await apiClient.post(`/bills/${id}/pay`, { amount, paymentMethod });
  return res.data;
};

// ==========================================
// 🛏️ BEDS & WARDS
// ==========================================
export const getBeds = async () => {
  const res = await apiClient.get('/beds');
  return res.data;
};

export const allocateBed = async (id, allocationData) => {
  const res = await apiClient.put(`/beds/${id}/allocate`, allocationData);
  return res.data;
};

export const dischargeBed = async (id) => {
  const res = await apiClient.put(`/beds/${id}/discharge`);
  return res.data;
};

// ==========================================
// 💊 PHARMACY & INVENTORY
// ==========================================
export const getMedicines = async () => {
  const res = await apiClient.get('/medicines');
  return res.data;
};

export const getMedicineAlerts = async () => {
  const res = await apiClient.get('/medicines/alerts');
  return res.data;
};

// ==========================================
// 📊 HOSPITAL OVERVIEW & SEED
// ==========================================
export const getHospitalOverview = async () => {
  const res = await apiClient.get('/analytics/hospital-overview');
  return res.data;
};

export const seedHospitalData = async () => {
  const res = await apiClient.post('/system/seed-all');
  return res.data;
};
