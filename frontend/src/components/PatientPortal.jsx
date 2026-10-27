import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Calendar, 
  FileText, 
  CreditCard, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Download, 
  Plus, 
  Stethoscope, 
  User,
  ShieldCheck,
  Droplet
} from 'lucide-react';
import { getMyPatientRecord, getAppointments, getMyPrescriptions, getBills } from '../services/api';

export default function PatientPortal({
  currentUser,
  onOpenBookAppointment,
  onViewPrescription,
  onPayBill,
  showToast,
}) {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPatientData = async () => {
    try {
      setIsLoading(true);
      const [pData, aData, rxData, bData] = await Promise.all([
        getMyPatientRecord(),
        getAppointments(),
        getMyPrescriptions(),
        getBills(),
      ]);
      setPatient(pData);
      setAppointments(aData);
      setPrescriptions(rxData);
      setBills(bData);
    } catch (err) {
      console.error('Failed to load patient records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, []);

  const totalDue = bills.reduce((acc, b) => acc + (b.balanceDue || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Patient Health Hero Banner */}
      <div className="hero-banner patient">
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-avatar">
              <User size={38} />
            </div>
            <div>
              <h1 className="hero-title">Welcome, {patient?.name || currentUser.name}</h1>
              <div className="hero-meta">
                <span className="meta-pill">
                  <Droplet size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Blood Group: {patient?.bloodGroup || 'O+'}
                </span>
                <span className="meta-pill">
                  Age: {patient?.age || 32} Yrs • {patient?.gender || 'Male'}
                </span>
                <span className="meta-pill">
                  Status: {patient?.admissionStatus || 'OPD Outpatient'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-primary" onClick={onOpenBookAppointment} style={{ background: '#ffffff', color: 'var(--primary)', fontWeight: '700' }}>
              <Calendar size={16} />
              <span>Book Appointment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Patient Live Vitals Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Blood Pressure</span>
            <div className="kpi-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Activity size={20} />
            </div>
          </div>
          <div className="kpi-value">{patient?.vitals?.bloodPressure || '120/80'}</div>
          <span className="badge badge-emerald">Normal Range</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Heart Rate (Pulse)</span>
            <div className="kpi-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <Heart size={20} />
            </div>
          </div>
          <div className="kpi-value">{patient?.vitals?.heartRate || 72} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>BPM</span></div>
          <span className="badge badge-emerald">Resting Normal</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Blood Oxygen (SpO2)</span>
            <div className="kpi-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
              <Activity size={20} />
            </div>
          </div>
          <div className="kpi-value">{patient?.vitals?.spO2 || 98}%</div>
          <span className="badge badge-emerald">Optimal Saturation</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Hospital Dues Due</span>
            <div className="kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: totalDue > 0 ? 'var(--warning-text)' : 'var(--success)' }}>
            ₹{totalDue.toLocaleString()}
          </div>
          <span className={`badge ${totalDue > 0 ? 'badge-amber' : 'badge-emerald'}`}>
            {totalDue > 0 ? 'Pending Payment' : 'Fully Cleared'}
          </span>
        </div>
      </div>

      {/* 3. Upcoming Appointments & Visits */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-header-icon">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="card-title">My Scheduled Consultations & OPD Queue</h3>
              <p className="card-subtitle">Real-time status of your doctor appointments</p>
            </div>
          </div>
          <button className="btn-secondary" onClick={onOpenBookAppointment} style={{ fontSize: '0.8rem' }}>
            <Plus size={14} />
            <span>New Booking</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="med-table">
            <thead>
              <tr>
                <th>Token #</th>
                <th>Doctor & Specialization</th>
                <th>Department</th>
                <th>Date & Time Slot</th>
                <th>Reported Symptoms</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No appointments scheduled. Click "Book Appointment" to visit an OPD specialist.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt._id} className="table-row">
                    <td>
                      <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1rem' }}>
                        {apt.tokenNumber}
                      </span>
                    </td>
                    <td>
                      <strong>{apt.doctorName}</strong>
                    </td>
                    <td>
                      <span className="badge badge-cyan">{apt.department}</span>
                    </td>
                    <td>
                      <div>{apt.appointmentDate}</div>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{apt.timeSlot}</span>
                    </td>
                    <td>{apt.symptoms}</td>
                    <td>
                      <span className={`badge ${apt.status === 'Completed' ? 'badge-emerald' : apt.status === 'In Consultation' ? 'badge-amber' : 'badge-cyan'}`}>
                        ● {apt.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Electronic Health Records & Prescriptions */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-header-icon cyan">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="card-title">My Electronic Health Records (Prescriptions)</h3>
              <p className="card-subtitle">Access digitally verified doctor prescriptions and dosage plans</p>
            </div>
          </div>
        </div>

        <div className="card-body">
          {prescriptions.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
              No past prescriptions recorded yet.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {prescriptions.map((rx) => (
                <div 
                  key={rx._id}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-xl)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-card-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)' }}>
                        {rx.rxNumber}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {new Date(rx.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '800', marginTop: '0.35rem' }}>
                      {rx.diagnosis}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      Prescribed by {rx.doctorName} ({rx.doctorDepartment})
                    </p>
                    <div style={{ marginTop: '0.75rem', fontSize: '0.82rem' }}>
                      <strong>Medicines ({rx.medicines?.length || 0}):</strong>
                      <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
                        {rx.medicines?.slice(0, 2).map((m, idx) => (
                          <li key={idx}>{m.name} — {m.frequency}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem' }}
                    onClick={() => onViewPrescription(rx)}
                  >
                    <FileText size={14} />
                    <span>View Official Prescription Slip</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Invoices & Medical Bills Ledger */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-header-icon amber">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="card-title">Hospital Invoices & Billing Ledger</h3>
              <p className="card-subtitle">Consultation, laboratory tests, and pharmacy bills</p>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="med-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Description / Items</th>
                <th>Total Billed</th>
                <th>Amount Paid</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Payment Action</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((b) => (
                <tr key={b._id} className="table-row">
                  <td style={{ fontFamily: 'monospace', fontWeight: '700' }}>{b.invoiceNumber}</td>
                  <td>
                    {b.items?.map((it, idx) => (
                      <div key={idx} style={{ fontSize: '0.84rem' }}>
                        • {it.description} (₹{it.amount})
                      </div>
                    ))}
                  </td>
                  <td><strong>₹{b.totalAmount.toLocaleString()}</strong></td>
                  <td style={{ color: 'var(--success)' }}>₹{b.paidAmount.toLocaleString()}</td>
                  <td style={{ color: b.balanceDue > 0 ? 'var(--warning-text)' : 'var(--success)', fontWeight: '700' }}>
                    ₹{b.balanceDue.toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${b.paymentStatus === 'Paid' ? 'badge-emerald' : 'badge-amber'}`}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {b.balanceDue > 0 ? (
                      <button
                        className="btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                        onClick={() => onPayBill(b)}
                      >
                        <CreditCard size={13} />
                        <span>Pay Due (₹{b.balanceDue.toLocaleString()})</span>
                      </button>
                    ) : (
                      <span className="badge badge-emerald">Cleared</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
