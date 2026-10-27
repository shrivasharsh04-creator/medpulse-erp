import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  BedDouble, 
  Pill, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  UserPlus,
  Activity,
  DollarSign
} from 'lucide-react';
import { getHospitalOverview, getBeds, allocateBed, dischargeBed, getMedicines, getBills } from '../services/api';

export default function AdminPortal({ currentUser, showToast }) {
  const [overview, setOverview] = useState(null);
  const [beds, setBeds] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Allocate Modal state
  const [allocatingBedId, setAllocatingBedId] = useState(null);
  const [patientNameInput, setPatientNameInput] = useState('');
  const [doctorNameInput, setDoctorNameInput] = useState('Dr. Priya Nair');

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [ovData, bedData, medData, billData] = await Promise.all([
        getHospitalOverview(),
        getBeds(),
        getMedicines(),
        getBills(),
      ]);
      setOverview(ovData);
      setBeds(bedData);
      setMedicines(medData);
      setBills(billData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!patientNameInput.trim()) {
      showToast('Enter patient name to allocate bed', 'error');
      return;
    }

    try {
      await allocateBed(allocatingBedId, {
        patientName: patientNameInput,
        admittingDoctor: doctorNameInput,
      });
      showToast('Bed allocated successfully!', 'success');
      setAllocatingBedId(null);
      setPatientNameInput('');
      loadAdminData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Allocation failed', 'error');
    }
  };

  const handleDischarge = async (bedId) => {
    try {
      await dischargeBed(bedId);
      showToast('Patient discharged and bed sanitized!', 'success');
      loadAdminData();
    } catch (err) {
      showToast('Discharge failed', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Admin Hero Banner */}
      <div className="hero-banner admin">
        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-avatar">
              <Building2 size={38} />
            </div>
            <div>
              <h1 className="hero-title">Hospital Executive Console</h1>
              <div className="hero-meta">
                <span className="meta-pill">
                  Chief Medical Administrator: {currentUser.name}
                </span>
                <span className="meta-pill">
                  Campus Facilities: Block A, B & Trauma Wing
                </span>
                <span className="meta-pill">
                  Live medpulseDB Connection Active
                </span>
              </div>
            </div>
          </div>

          <button className="btn-secondary" onClick={loadAdminData} disabled={isLoading} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}>
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span>Sync Hospital Metrics</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Bed Occupancy Rate</span>
            <div className="kpi-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <BedDouble size={20} />
            </div>
          </div>
          <div className="kpi-value">{overview?.occupancyRate || 33}%</div>
          <span className="badge badge-emerald">
            {overview?.occupiedBeds || 2} of {overview?.totalBeds || 6} Beds Occupied
          </span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Gross Hospital Revenue</span>
            <div className="kpi-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--success)' }}>
            ₹{(overview?.totalRevenue || 5500).toLocaleString()}
          </div>
          <span className="badge badge-emerald">Collected & Settled</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Unpaid Patient Dues</span>
            <div className="kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: 'var(--warning-text)' }}>
            ₹{(overview?.pendingDues || 800).toLocaleString()}
          </div>
          <span className="badge badge-amber">Accounts Receivable</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">Pharmacy Stock Alerts</span>
            <div className="kpi-icon" style={{ background: '#fef2f2', color: '#ef4444' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: (overview?.lowStockCount || 0) > 0 ? 'var(--danger)' : 'var(--text-main)' }}>
            {overview?.lowStockCount || 2} Items
          </div>
          <span className={`badge ${(overview?.lowStockCount || 0) > 0 ? 'badge-rose' : 'badge-emerald'}`}>
            {(overview?.lowStockCount || 0) > 0 ? 'Below Reorder Level' : 'Adequate Supply'}
          </span>
        </div>
      </div>

      {/* 3. Ward & Bed Occupancy Grid */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-header-icon">
              <BedDouble size={18} />
            </div>
            <div>
              <h3 className="card-title">Ward & Bed Occupancy Map</h3>
              <p className="card-subtitle">Real-time status of ICU, General, Deluxe, and Emergency beds</p>
            </div>
          </div>
        </div>

        <div className="card-body">
          <div className="beds-grid">
            {beds.map((b) => (
              <div key={b._id} className={`bed-card ${b.isOccupied ? 'occupied' : 'free'}`}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: '800' }}>{b.bedNumber}</span>
                    <span className={`badge ${b.isOccupied ? 'badge-rose' : 'badge-emerald'}`}>
                      {b.isOccupied ? '● Occupied' : '○ Available'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {b.wardType}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {b.floor} • ₹{b.dailyCharge}/day
                  </div>

                  {b.isOccupied && (
                    <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-md)', fontSize: '0.78rem' }}>
                      <div>Patient: <strong>{b.occupiedBy?.patientName}</strong></div>
                      <div>Doctor: {b.occupiedBy?.admittingDoctor}</div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1rem' }}>
                  {b.isOccupied ? (
                    <button
                      className="btn-secondary"
                      style={{ width: '100%', fontSize: '0.78rem', padding: '0.4rem' }}
                      onClick={() => handleDischarge(b._id)}
                    >
                      Discharge & Sanitize Bed
                    </button>
                  ) : (
                    <button
                      className="btn-primary"
                      style={{ width: '100%', fontSize: '0.78rem', padding: '0.4rem' }}
                      onClick={() => setAllocatingBedId(b._id)}
                    >
                      Admit Patient Here
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Allocate Bed Modal */}
      {allocatingBedId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '1.75rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Admit Patient to Bed</h3>
            <p className="card-subtitle" style={{ marginBottom: '1.25rem' }}>Assign room and attending physician</p>
            <form onSubmit={handleAllocate}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Patient Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Suresh Menon"
                  value={patientNameInput}
                  onChange={(e) => setPatientNameInput(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Admitting Physician</label>
                <select
                  className="form-select"
                  value={doctorNameInput}
                  onChange={(e) => setDoctorNameInput(e.target.value)}
                >
                  <option value="Dr. Priya Nair">Dr. Priya Nair (Cardiology)</option>
                  <option value="Dr. Rajesh Gupta">Dr. Rajesh Gupta (General Medicine)</option>
                  <option value="Dr. Sunita Rao">Dr. Sunita Rao (Orthopedics)</option>
                  <option value="Dr. Sameer Deshmukh">Dr. Sameer Deshmukh (Neurology)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn-secondary" onClick={() => setAllocatingBedId(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Confirm Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Pharmacy Inventory & Stock Alert Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-header-icon amber">
              <Pill size={18} />
            </div>
            <div>
              <h3 className="card-title">Pharmacy Medicine Stock & Reorder Levels</h3>
              <p className="card-subtitle">Automated warnings when drug inventory drops below safety thresholds</p>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="med-table">
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Category</th>
                <th>Stock In Units</th>
                <th>Reorder Threshold</th>
                <th>Unit Price</th>
                <th>Manufacturer</th>
                <th>Inventory Health</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => {
                const isLow = m.stockUnits <= m.reorderThreshold;
                return (
                  <tr key={m._id} className="table-row">
                    <td><strong>{m.name}</strong></td>
                    <td><span className="badge badge-cyan">{m.category}</span></td>
                    <td>
                      <span style={{ fontWeight: '800', color: isLow ? 'var(--danger)' : 'var(--text-main)', fontSize: '1rem' }}>
                        {m.stockUnits} Units
                      </span>
                    </td>
                    <td>{m.reorderThreshold} Units</td>
                    <td>₹{m.unitPrice}</td>
                    <td>{m.manufacturer}</td>
                    <td>
                      <span className={`badge ${isLow ? 'badge-rose' : 'badge-emerald'}`}>
                        {isLow ? '▲ Low Stock Warning' : '● Healthy Supply'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
