import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import PatientPortal from './components/PatientPortal';
import DoctorPortal from './components/DoctorPortal';
import AdminPortal from './components/AdminPortal';
import BookAppointmentModal from './components/BookAppointmentModal';
import PrescriptionSlipModal from './components/PrescriptionSlipModal';
import PayBillModal from './components/PayBillModal';
import { getStoredAuth, setAuthSession, clearAuthSession, seedHospitalData } from './services/api';
import { CheckCircle2, AlertCircle, X, HeartPulse, Database, Server, ShieldCheck } from 'lucide-react';
import './App.css';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredAuth().user);
  const [authToken, setAuthToken] = useState(() => getStoredAuth().token);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('medpulse_theme') || 'light');
  const [toast, setToast] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Modal dialog states
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [viewingPrescription, setViewingPrescription] = useState(null);
  const [payingBill, setPayingBill] = useState(null);

  // Apply Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('medpulse_theme', theme);
  }, [theme]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const handleLoginSuccess = (token, user) => {
    setAuthSession(token, user);
    setAuthToken(token);
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    clearAuthSession();
    setAuthToken(null);
    setCurrentUser(null);
    showToast('Signed out of MedPulse OS', 'success');
  };

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      const res = await seedHospitalData();
      showToast(res.message || 'Hospital demo data populated successfully!', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast('Failed to seed demo data', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="app-container">
      {/* Toast popup */}
      {toast && (
        <div 
          className="card" 
          style={{ 
            position: 'fixed', 
            bottom: '2rem', 
            right: '2rem', 
            zIndex: 200, 
            padding: '0.85rem 1.25rem',
            borderLeft: `4px solid ${toast.type === 'error' ? 'var(--danger)' : 'var(--success)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: 'var(--shadow-xl)',
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={20} color="var(--danger)" />
          ) : (
            <CheckCircle2 size={20} color="var(--success)" />
          )}
          <span style={{ fontSize: '0.88rem', fontWeight: '600' }}>{toast.message}</span>
          <button 
            onClick={() => setToast(null)} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        onSeedData={handleSeedData}
        isSeeding={isSeeding}
        currentTheme={theme}
        onToggleTheme={setTheme}
        onOpenBookAppointment={() => setIsBookModalOpen(true)}
      />

      {/* Main Views Container */}
      <main className="main-content">
        {!currentUser ? (
          <AuthModal onLoginSuccess={handleLoginSuccess} showToast={showToast} />
        ) : (
          <>
            {/* 1. PATIENT PORTAL */}
            {currentUser.role === 'patient' && (
              <PatientPortal
                currentUser={currentUser}
                onOpenBookAppointment={() => setIsBookModalOpen(true)}
                onViewPrescription={(rx) => setViewingPrescription(rx)}
                onPayBill={(b) => setPayingBill(b)}
                showToast={showToast}
              />
            )}

            {/* 2. DOCTOR PORTAL */}
            {currentUser.role === 'doctor' && (
              <DoctorPortal
                currentUser={currentUser}
                showToast={showToast}
              />
            )}

            {/* 3. HOSPITAL ADMIN PORTAL */}
            {currentUser.role === 'admin' && (
              <AdminPortal
                currentUser={currentUser}
                showToast={showToast}
              />
            )}
          </>
        )}
      </main>

      {/* Modal Dialogs */}
      <BookAppointmentModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={() => window.location.reload()}
        showToast={showToast}
      />

      <PrescriptionSlipModal
        prescription={viewingPrescription}
        onClose={() => setViewingPrescription(null)}
      />

      <PayBillModal
        bill={payingBill}
        onClose={() => setPayingBill(null)}
        onSuccess={() => window.location.reload()}
        showToast={showToast}
      />

      {/* Enterprise Healthcare Footer */}
      <footer className="med-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <HeartPulse size={18} color="var(--primary)" />
          <strong>MedPulse OS v2.5.0 Enterprise</strong>
          <span>• Smart Hospital & Clinical Management ERP</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.78rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--success)' }}>
            ● Medical Systems Operational
          </span>
          <span><Database size={12} style={{ display: 'inline', marginRight: '3px' }} /> MongoDB medpulseDB</span>
          <span><Server size={12} style={{ display: 'inline', marginRight: '3px' }} /> Express Gateway :5001</span>
        </div>
      </footer>
    </div>
  );
}
