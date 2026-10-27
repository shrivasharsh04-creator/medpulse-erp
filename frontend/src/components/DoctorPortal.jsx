import React, { useState, useEffect } from 'react';
import { 
  Stethoscope, 
  Users, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Plus, 
  Trash2, 
  Activity, 
  Heart, 
  RefreshCw,
  Search,
  Check
} from 'lucide-react';
import { getDoctorOpdQueue, updateAppointmentStatus, createPrescription } from '../services/api';

export default function DoctorPortal({ currentUser, showToast }) {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Prescription Form State
  const [diagnosis, setDiagnosis] = useState('');
  const [symptomsObserved, setSymptomsObserved] = useState('');
  const [dietaryAdvice, setDietaryAdvice] = useState('Maintain low sodium, regular hydration, and 8 hours sleep.');
  const [followUpDate, setFollowUpDate] = useState('In 7 Days');
  const [labTests, setLabTests] = useState('Complete Blood Count (CBC)');
  const [medicines, setMedicines] = useState([
    { name: 'Atorvastatin 20mg', dosage: '20 mg', frequency: '0-0-1 (Night)', duration: '15 Days', notes: 'After meal' },
    { name: 'Aspirin 75mg', dosage: '75 mg', frequency: '1-0-0 (Morning)', duration: '15 Days', notes: 'Blood thinner' },
  ]);
  const [isSubmittingRx, setIsSubmittingRx] = useState(false);

  const loadQueue = async () => {
    try {
      setIsLoading(true);
      const data = await getDoctorOpdQueue();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load doctor queue:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      showToast(`Appointment status updated to ${status}`, 'success');
      loadQueue();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '500 mg', frequency: '1-0-1 (After food)', duration: '5 Days', notes: '' }]);
  };

  const handleRemoveMedicine = (index) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleGeneratePrescription = async (e) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      showToast('Please enter clinical diagnosis', 'error');
      return;
    }
    if (medicines.length === 0 || !medicines[0].name.trim()) {
      showToast('Please add at least one prescribed drug', 'error');
      return;
    }

    try {
      setIsSubmittingRx(true);
      await createPrescription({
        appointmentId: selectedAppointment?._id,
        patientName: selectedAppointment?.patientName || 'Patient',
        patientEmail: selectedAppointment?.patientEmail || 'patient@hospital.com',
        doctorName: currentUser.name,
        doctorDepartment: currentUser.department || 'Cardiology',
        diagnosis,
        symptomsObserved,
        medicines,
        labTestsRecommended: labTests ? labTests.split(',').map((s) => s.trim()) : [],
        dietaryAdvice,
        followUpDate,
      });

      showToast(`Electronic Prescription issued for ${selectedAppointment?.patientName}!`, 'success');
      setSelectedAppointment(null);
      setDiagnosis('');
      loadQueue();
    } catch (err) {
      showToast('Failed to generate prescription', 'error');
    } finally {
      setIsSubmittingRx(false);
    }
  };

  const waitingCount = appointments.filter((a) => a.status === 'Waiting').length;
  const completedCount = appointments.filter((a) => a.status === 'Completed').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Doctor Hero Banner */}
      <div className="hero-banner doctor">
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-avatar">
              <Stethoscope size={38} />
            </div>
            <div>
              <h1 className="hero-title">{currentUser.name}</h1>
              <div className="hero-meta">
                <span className="meta-pill">
                  Department of {currentUser.department || 'Cardiology'}
                </span>
                <span className="meta-pill">
                  OPD Room: Room 104, Heart Wing
                </span>
                <span className="meta-pill">
                  Today's Date: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <button className="btn-secondary" onClick={loadQueue} disabled={isLoading} style={{ color: '#ffffff', background: 'rgba(255,255,255,0.15)', border: 'none' }}>
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Doctor KPI Overview */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Waiting In OPD Queue</span>
            <div className="kpi-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--warning-text)' }}>{waitingCount} Patients</div>
          <span className="badge badge-amber">Immediate Attention</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Consultations Completed</span>
            <div className="kpi-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-value">{completedCount} Patients</div>
          <span className="badge badge-emerald">Discharged & Prescribed</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Total Appointments</span>
            <div className="kpi-icon" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">{appointments.length} Total</div>
          <span className="badge badge-cyan">Today's Schedule</span>
        </div>
      </div>

      {/* 3. Live OPD Queue Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-header-icon cyan">
              <Clock size={18} />
            </div>
            <div>
              <h3 className="card-title">Live OPD Patient Queue</h3>
              <p className="card-subtitle">Consult patients, review symptoms, and generate digital prescriptions</p>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="med-table">
            <thead>
              <tr>
                <th>Token #</th>
                <th>Patient Details</th>
                <th>Reported Symptoms</th>
                <th>Consultation Fee</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Clinical Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No patients currently waiting in your OPD queue.
                  </td>
                </tr>
              ) : (
                appointments.map((apt) => (
                  <tr key={apt._id} className="table-row">
                    <td>
                      <span style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1.1rem' }}>
                        {apt.tokenNumber}
                      </span>
                    </td>
                    <td>
                      <div><strong>{apt.patientName}</strong></div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{apt.patientPhone || apt.patientEmail}</span>
                    </td>
                    <td>{apt.symptoms}</td>
                    <td>
                      <span className="badge badge-emerald">₹{apt.consultationFee} Paid</span>
                    </td>
                    <td>
                      <span className={`badge ${apt.status === 'Completed' ? 'badge-emerald' : apt.status === 'In Consultation' ? 'badge-amber' : 'badge-cyan'}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {apt.status === 'Waiting' && (
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                            onClick={() => handleStatusChange(apt._id, 'In Consultation')}
                          >
                            Call Patient In
                          </button>
                        )}
                        {apt.status !== 'Completed' && (
                          <button
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                            onClick={() => setSelectedAppointment(apt)}
                          >
                            <FileText size={13} />
                            <span>Write Rx (Prescribe)</span>
                          </button>
                        )}
                        {apt.status === 'Completed' && (
                          <span className="badge badge-emerald">
                            <Check size={12} style={{ marginRight: '4px' }} /> Rx Issued
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Interactive Electronic Prescription Builder (When Patient Selected) */}
      {selectedAppointment && (
        <div className="card" style={{ border: '2px solid var(--primary)', animation: 'fadeIn 0.25s ease-out' }}>
          <div className="card-header" style={{ background: 'var(--primary-light)' }}>
            <div className="card-title-group">
              <div className="card-header-icon" style={{ background: '#ffffff' }}>
                <Stethoscope size={20} />
              </div>
              <div>
                <h3 className="card-title" style={{ color: 'var(--primary-hover)' }}>
                  Electronic Prescription (Rx) Generator
                </h3>
                <p className="card-subtitle">
                  Prescribing for: <strong>{selectedAppointment.patientName}</strong> (Token: {selectedAppointment.tokenNumber})
                </p>
              </div>
            </div>
            <button
              className="btn-secondary"
              onClick={() => setSelectedAppointment(null)}
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem' }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleGeneratePrescription} style={{ padding: '1.5rem' }}>
            <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Clinical Diagnosis *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., Acute Bronchitis, Essential Hypertension"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Clinical Observations & Vitals</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g., BP 130/84, Chest wheezing present"
                  value={symptomsObserved}
                  onChange={(e) => setSymptomsObserved(e.target.value)}
                />
              </div>
            </div>

            {/* Prescribed Medicines Builder Table */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                <label className="form-label" style={{ fontWeight: '700' }}>
                  💊 Prescribed Medicines (Rx List)
                </label>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddMedicine}
                  style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                >
                  <Plus size={13} />
                  <span>Add Medicine Row</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {medicines.map((med, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr auto', gap: '0.65rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Medicine Name (e.g. Dolo 650)"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Dosage (500mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Frequency (1-0-1)"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Duration (5 Days)"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Instructions (After Food)"
                      value={med.notes}
                      onChange={(e) => handleMedicineChange(idx, 'notes', e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-icon-nav"
                      onClick={() => handleRemoveMedicine(idx)}
                      style={{ color: 'var(--danger)', height: '36px', width: '36px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Lab Recommendations & Advice */}
            <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Recommended Laboratory Tests</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="CBC, Lipid Profile, Chest X-Ray"
                  value={labTests}
                  onChange={(e) => setLabTests(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lifestyle / Dietary Advice</label>
                <input
                  type="text"
                  className="form-input"
                  value={dietaryAdvice}
                  onChange={(e) => setDietaryAdvice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Follow-Up Schedule</label>
                <input
                  type="text"
                  className="form-input"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmittingRx}
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.92rem' }}
            >
              {isSubmittingRx ? 'Signing & Storing Prescription...' : 'Sign & Issue Digital Prescription (Rx)'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
