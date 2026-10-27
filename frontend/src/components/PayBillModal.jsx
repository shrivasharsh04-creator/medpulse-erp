import React, { useState } from 'react';
import { CreditCard, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { payBill } from '../services/api';

export default function PayBillModal({ bill, onClose, onSuccess, showToast }) {
  const [amount, setAmount] = useState(bill ? bill.balanceDue.toString() : '0');
  const [paymentMethod, setPaymentMethod] = useState('UPI / Online NetBanking');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!bill) return null;

  const handlePay = async (e) => {
    e.preventDefault();
    const payAmt = Number(amount);
    if (!payAmt || payAmt <= 0) {
      showToast('Enter a valid payment amount', 'error');
      return;
    }
    if (payAmt > bill.balanceDue) {
      showToast(`Amount cannot exceed balance due of ₹${bill.balanceDue}`, 'error');
      return;
    }

    try {
      setIsProcessing(true);
      const res = await payBill(bill._id, payAmt, paymentMethod);
      showToast(`Payment of ₹${payAmt.toLocaleString()} cleared successfully! (Receipt: ${res.receipt?.receiptNumber})`, 'success');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.error || 'Payment failed', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120, padding: '1rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '480px', animation: 'fadeIn 0.2s ease-out' }}>
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-header-icon amber">
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="card-title">Hospital Invoice Payment</h3>
              <p className="card-subtitle">Invoice: {bill.invoiceNumber}</p>
            </div>
          </div>
          <button className="btn-icon-nav" onClick={onClose} style={{ border: 'none' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handlePay} style={{ padding: '1.5rem' }}>
          {/* Itemized charges summary */}
          <div style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Billed Items:
            </div>
            {bill.items?.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', padding: '0.2rem 0' }}>
                <span>{it.description}</span>
                <strong>₹{it.amount}</strong>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border)', fontSize: '1rem' }}>
              <span>Balance Due:</span>
              <strong style={{ color: 'var(--warning-text)' }}>₹{bill.balanceDue.toLocaleString()}</strong>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Payment Mode</label>
            <select
              className="form-select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="UPI / Online NetBanking">UPI (Google Pay, PhonePe, Paytm)</option>
              <option value="Card">Debit / Credit Card (Visa/Mastercard)</option>
              <option value="Cash">Hospital Cash Counter</option>
              <option value="Insurance TPA">Cashless Mediclaim Insurance TPA</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Amount to Pay Now (₹)</label>
            <input
              type="number"
              className="form-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={bill.balanceDue}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isProcessing}>
              {isProcessing ? 'Settling Payment...' : `Authorize ₹${Number(amount || 0).toLocaleString()} Payment`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
