import React, { useState } from 'react';
import { 
  HeartPulse, 
  Lock, 
  Mail, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

export default function AuthModal({ onLoginSuccess, showToast }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    department: 'General Medicine',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isRegister) {
        const res = await registerUser(formData);
        showToast('Registration successful! Welcome to MedPulse OS.', 'success');
        onLoginSuccess(res.token, res.user);
      } else {
        const res = await loginUser({ email: formData.email, password: formData.password });
        showToast(`Welcome back, ${res.user.name}!`, 'success');
        onLoginSuccess(res.token, res.user);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Authentication failed';
      showToast(errMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (role) => {
    let email = 'patient@hospital.com';
    let password = 'patient123';
    if (role === 'doctor') {
      email = 'doctor@hospital.com';
      password = 'doctor123';
    } else if (role === 'admin') {
      email = 'admin@hospital.com';
      password = 'admin123';
    }

    setIsLoading(true);
    try {
      const res = await loginUser({ email, password });
      showToast(`Signed in as ${role.toUpperCase()}: ${res.user.name}`, 'success');
      onLoginSuccess(res.token, res.user);
    } catch (err) {
      showToast('Please click "Seed Demo Data" first or check server status.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '4rem auto', width: '100%', padding: '0 1rem' }}>
      <div className="card" style={{ padding: '2.25rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="brand-icon-wrapper" style={{ margin: '0 auto 1rem', width: '56px', height: '56px' }}>
            <HeartPulse size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em' }}>MedPulse OS</h2>
          <p className="card-subtitle" style={{ fontSize: '0.86rem' }}>
            Next-Gen Hospital Clinical Management & Healthcare Portal
          </p>
        </div>

        {/* 1-Click Demo Profiles */}
        <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
            ⚡ 1-Click Role-Based Demo Portals:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              onClick={() => handleQuickDemo('patient')}
            >
              <span>👤 <strong>Patient:</strong> Rohan Verma</span>
              <span className="badge badge-emerald">Patient Portal ➔</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              onClick={() => handleQuickDemo('doctor')}
            >
              <span>🩺 <strong>Doctor:</strong> Dr. Priya Nair</span>
              <span className="badge badge-cyan">OPD Queue ➔</span>
            </button>
            <button
              type="button"
              className="btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              onClick={() => handleQuickDemo('admin')}
            >
              <span>🏛️ <strong>Admin:</strong> Dr. Arvind Mehra</span>
              <span className="badge badge-amber">Executive ➔</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Dr. Rajesh / Patient Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="user@hospital.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">Assign Role</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor / Specialist</option>
                <option value="admin">Hospital Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {isLoading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In to Hospital Portal'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.84rem' }}>
          <button
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
          >
            {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register as Patient"}
          </button>
        </div>
      </div>
    </div>
  );
}
