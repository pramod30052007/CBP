import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { paymentAPI } from '../utils/api';

const PaymentPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentAPI.getMy()
      .then(r => setPayments(r.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalPaid = payments.filter(p => p.payment_status === 'completed').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const totalPending = payments.filter(p => p.payment_status === 'pending').reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const totalFailed = payments.filter(p => p.payment_status === 'failed').reduce((s, p) => s + parseFloat(p.amount || 0), 0);

  return (
    <>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1a56db,#1140a6)' }} className="text-white py-4">
        <div className="container">
          <h3 className="fw-bold mb-0"><i className="bi bi-credit-card me-2"></i>Payments</h3>
          <p className="mb-0 opacity-75 small">{payments.length} transactions</p>
        </div>
      </div>

      <div className="container py-5">

        {/* Summary Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="stat-card green d-flex align-items-center gap-3">
              <i className="bi bi-currency-rupee" style={{ fontSize: '2.5rem', opacity: 0.7 }}></i>
              <div>
                <div className="stat-value">₹{totalPaid.toFixed(0)}</div>
                <div className="stat-label">Total Paid</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card orange d-flex align-items-center gap-3">
              <i className="bi bi-clock" style={{ fontSize: '2.5rem', opacity: 0.7 }}></i>
              <div>
                <div className="stat-value">₹{totalPending.toFixed(0)}</div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card blue d-flex align-items-center gap-3">
              <i className="bi bi-receipt" style={{ fontSize: '2.5rem', opacity: 0.7 }}></i>
              <div>
                <div className="stat-value">{payments.length}</div>
                <div className="stat-label">Total Transactions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ width: 48, height: 48 }}></div>
            <p className="mt-3 text-muted">Loading transactions...</p>
          </div>
        ) : (
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <strong>Transaction History</strong>
              <small className="text-muted">{payments.length} records</small>
            </div>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Hotel</th>
                    <th>Worker</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.payment_id}>
                      <td className="text-muted small">#{p.payment_id}</td>
                      <td>{p.hotel_name || '—'}</td>
                      <td>{p.worker_name || '—'}</td>
                      <td className="text-muted">{new Date(p.transaction_date).toLocaleDateString()}</td>
                      <td>
                        <span className="badge bg-light text-dark border text-capitalize">
                          {p.payment_method}
                        </span>
                      </td>
                      <td className="fw-bold">₹{parseFloat(p.amount).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${p.payment_status === 'completed' ? 'bg-success' : p.payment_status === 'pending' ? 'bg-warning text-dark' : p.payment_status === 'refunded' ? 'bg-info' : 'bg-secondary'}`}>
                          {p.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-muted py-5">
                        <i className="bi bi-receipt fs-1 d-block mb-3 opacity-50"></i>
                        No payment records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default PaymentPage;
