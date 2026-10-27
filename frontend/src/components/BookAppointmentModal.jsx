import React, { useState, useEffect } from 'react';
import { Calendar, X, Clock, Stethoscope, CheckCircle2 } from 'lucide-react';
import { getDoctors, bookAppointment } from '../services/api';

export default function BookAppointmentModal({ isOpen, onClose, onSuccess, showToast }) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    department: 'Cardiology',
    appointmentDate: new Date().toISOString().slice(0, 10),
    timeSlot: '10:30 AM',
    symptoms: '',
    patientPhone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getDoctors()
        .then((docs) => {
          setDoctors(docs);
          if (docs.length > 0) {
            setSelectedDoctor(docs[0]);
            setFormData((prev) => ({ ...prev, department: docs[0].department }));
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDoctorChange = (e) => {
    const docId = e.target.value;
    const doc = doctors.find((d) => d._id === docId);
    if (doc) {
      setSelectedDoctor(doc);
      setFormData({ ...formData, department: doc.department });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.symptoms.trim()) {
      showToast('Please describe your symptoms briefly', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await bookAppointment({
        doctorId: selectedDoctor?._id,
        doctorName: selectedDoctor?.name || 'Dr. Priya Nair',
        department: formData.department,
        appointmentDate: formData.appointmentDate,
        timeSlot: formData.timeSlot,
        symptoms: formData.symptoms,
        patientPhone: formData.patientPhone,
      });

      showToast(`Appointment Confirmed! Assigned Token: ${res.appointment.tokenNumber}`, 'success');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to book appointment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '520px', animation: 'fadeIn 0.2s ease-out' }}>
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-header-icon">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="card-title">Book Outpatient Consultation (OPD)</h3>
              <p className="card-subtitle">Choose specialist, date, and preferred time slot</p>
            </div>
          </div>
          <button className="btn-icon-nav" onClick={onClose} style={{ border: 'none' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Consulting Specialist & Department</label>
            <select
              className="form-select"
              value={selectedDoctor?._id || ''}
              onChange={handleDoctorChange}
            >
              {doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} — {d.department} (Fee: ₹{d.consultationFee})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Consultation Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time Slot</label>
              <select
                className="form-select"
                value={formData.timeSlot}
                onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
              >
                <option value="09:30 AM">09:30 AM - Morning</option>
                <option value="10:30 AM">10:30 AM - Morning</option>
                <option value="11:45 AM">11:45 AM - Noon</option>
                <option value="02:30 PM">02:30 PM - Afternoon</option>
                <option value="04:30 PM">04:30 PM - Evening</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Contact Mobile Number</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+91 98765 43210"
              value={formData.patientPhone}
              onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Describe Symptoms or Chief Complaint *</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="e.g. Experiencing mild chest tightness, shortness of breath on climbing stairs..."
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              required
            ></textarea>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>OPD Token Consultation Charge:</span>
            <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>₹{selectedDoctor?.consultationFee || 800}</strong>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Issuing Token...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
