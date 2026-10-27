import React from 'react';
import { X, Printer, Download, Stethoscope, ShieldCheck } from 'lucide-react';

export default function PrescriptionSlipModal({ prescription, onClose }) {
  if (!prescription) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '1.5rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', animation: 'fadeIn 0.25s ease-out' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.5rem 0' }}>
          <button className="btn-icon-nav" onClick={onClose} style={{ border: 'none' }}>
            <X size={18} />
          </button>
        </div>

        {/* Printable Prescription Slip */}
        <div className="rx-slip-container" style={{ margin: '0 1.5rem 1.5rem', border: '2px solid var(--border)' }}>
          <div className="rx-slip-header">
            <div>
              <div className="rx-hospital-name">MEDPULSE SPECIALITY HOSPITAL</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Center for Advanced Clinical Care & Diagnostics • License #MED-2026-IND
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Helpline: 1800-419-MEDPULSE | Emergency: 108
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-emerald" style={{ marginBottom: '4px' }}>
                <ShieldCheck size={12} style={{ marginRight: '4px' }} /> Digitally Verified Rx
              </span>
              <div style={{ fontFamily: 'monospace', fontWeight: '800', color: 'var(--primary)' }}>
                {prescription.rxNumber}
              </div>
            </div>
          </div>

          {/* Doctor & Patient Metadata Row */}
          <div className="rx-meta-grid">
            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Patient Name</div>
              <strong>{prescription.patientName}</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Age: {prescription.patientAge || 32} Yrs • Gender: {prescription.patientGender || 'Male'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prescribing Physician</div>
              <strong>{prescription.doctorName}</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {prescription.doctorDepartment} • OPD Speciality
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prescription Date</div>
              <strong>{new Date(prescription.createdAt || Date.now()).toLocaleDateString()}</strong>
            </div>
          </div>

          {/* Diagnosis */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Clinical Diagnosis
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary)' }}>
              {prescription.diagnosis}
            </div>
            {prescription.symptomsObserved && (
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Symptoms Observed: {prescription.symptomsObserved}
              </div>
            )}
          </div>

          {/* Rx Symbol & Medicine Table */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="rx-symbol">℞</div>
            <table className="med-table" style={{ border: '1px solid var(--border)' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Medication (Brand & Strength)</th>
                  <th>Dosage</th>
                  <th>Frequency (M-A-N)</th>
                  <th>Duration</th>
                  <th>Special Notes</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medicines?.map((m, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td><strong>{m.name}</strong></td>
                    <td>{m.dosage}</td>
                    <td><span className="badge badge-cyan">{m.frequency}</span></td>
                    <td>{m.duration}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.notes || 'As advised'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lab Tests & Advice */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem', background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
            <div>
              <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                🔬 Recommended Investigations
              </strong>
              {prescription.labTestsRecommended?.length > 0 ? (
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.84rem' }}>
                  {prescription.labTestsRecommended.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              ) : (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>None required</span>
              )}
            </div>

            <div>
              <strong style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                🥗 Advice & Review
              </strong>
              <div style={{ fontSize: '0.84rem' }}>{prescription.dietaryAdvice}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '700', marginTop: '6px' }}>
                Follow Up: {prescription.followUpDate}
              </div>
            </div>
          </div>

          {/* Signature & Print Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              This electronic prescription is authenticated electronically in compliance with Medical Council regulations.
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderBottom: '1px solid #000', width: '160px', marginBottom: '4px' }}></div>
              <div style={{ fontSize: '0.78rem', fontWeight: '700' }}>{prescription.doctorName}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Authorized Medical Signatory</div>
            </div>
          </div>
        </div>

        {/* Modal Action Bar */}
        <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={() => window.print()}>
            <Printer size={15} />
            <span>Print / Save PDF Slip</span>
          </button>
        </div>
      </div>
    </div>
  );
}
