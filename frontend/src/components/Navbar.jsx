import React from 'react';
import { 
  Activity, 
  Calendar, 
  FileText, 
  CreditCard, 
  Users, 
  LayoutDashboard, 
  LogOut, 
  Sun, 
  Moon, 
  Sparkles,
  BedDouble,
  Pill,
  Stethoscope,
  ShieldCheck,
  HeartPulse
} from 'lucide-react';

export default function Navbar({
  user,
  activeTab,
  onTabChange,
  onLogout,
  onSeedData,
  isSeeding,
  currentTheme,
  onToggleTheme,
  onOpenBookAppointment,
}) {
  const isPatient = user?.role === 'patient';
  const isDoctor = user?.role === 'doctor';
  const isAdmin = user?.role === 'admin';

  const getInitials = (name = '') => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'MP';
  };

  return (
    <header className="med-navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="brand-section" onClick={() => onTabChange('dashboard')}>
          <div className="brand-icon-wrapper">
            <HeartPulse size={26} />
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">MedPulse OS</h1>
              <span className={`role-chip ${user?.role || 'patient'}`}>
                {isPatient ? 'Patient Portal' : isDoctor ? 'Doctor Console' : 'Hospital Admin'}
              </span>
            </div>
            <p className="brand-subtitle">Smart Healthcare & Hospital Management ERP • medpulseDB</p>
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <nav className="navbar-nav-tabs">
          {/* Patient Tabs */}
          {isPatient && (
            <>
              <button
                className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => onTabChange('dashboard')}
              >
                <LayoutDashboard size={15} />
                <span>My Health & Visits</span>
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
                onClick={() => onTabChange('prescriptions')}
              >
                <FileText size={15} />
                <span>My Prescriptions (EHR)</span>
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
                onClick={() => onTabChange('billing')}
              >
                <CreditCard size={15} />
                <span>Invoices & Payments</span>
              </button>
            </>
          )}

          {/* Doctor Tabs */}
          {isDoctor && (
            <>
              <button
                className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => onTabChange('dashboard')}
              >
                <Stethoscope size={15} />
                <span>Live OPD Queue</span>
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'patients' ? 'active' : ''}`}
                onClick={() => onTabChange('patients')}
              >
                <Users size={15} />
                <span>Patient Health Records</span>
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'prescriptions' ? 'active' : ''}`}
                onClick={() => onTabChange('prescriptions')}
              >
                <FileText size={15} />
                <span>Issued Prescriptions</span>
              </button>
            </>
          )}

          {/* Admin Tabs */}
          {isAdmin && (
            <>
              <button
                className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => onTabChange('dashboard')}
              >
                <LayoutDashboard size={15} />
                <span>Executive Overview</span>
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'beds' ? 'active' : ''}`}
                onClick={() => onTabChange('beds')}
              >
                <BedDouble size={15} />
                <span>Ward & Bed Occupancy</span>
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'pharmacy' ? 'active' : ''}`}
                onClick={() => onTabChange('pharmacy')}
              >
                <Pill size={15} />
                <span>Pharmacy & Stock Alerts</span>
              </button>
              <button
                className={`nav-tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
                onClick={() => onTabChange('billing')}
              >
                <CreditCard size={15} />
                <span>Revenue & Bills</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Quick Book Button for Patients */}
          {isPatient && (
            <button className="btn-primary" onClick={onOpenBookAppointment} style={{ padding: '0.45rem 0.95rem', fontSize: '0.82rem' }}>
              <Calendar size={14} />
              <span>Book Appointment</span>
            </button>
          )}

          {/* Seed Demo Data Button */}
          <button
            className="btn-icon-nav"
            onClick={onSeedData}
            disabled={isSeeding}
            title="Populate Demo Hospital Data (Doctors, Beds, Medicines, Invoices)"
          >
            <Sparkles size={16} className={isSeeding ? 'animate-spin' : ''} color="var(--primary)" />
          </button>

          {/* Theme Toggle */}
          <button
            className="btn-icon-nav"
            onClick={() => onToggleTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {currentTheme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User Profile & Logout */}
          {user && (
            <div className="user-badge-cluster">
              <div className="user-avatar-circle">
                {getInitials(user.name)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', lineHeight: 1.1 }}>{user.name}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{user.department || user.role}</span>
              </div>
              <button
                className="btn-icon-nav"
                onClick={onLogout}
                title="Sign out of hospital session"
                style={{ width: '32px', height: '32px', border: 'none', marginLeft: '4px' }}
              >
                <LogOut size={14} color="var(--danger)" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
