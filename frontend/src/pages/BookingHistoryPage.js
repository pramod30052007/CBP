import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { bookingAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  pending: 'warning', accepted: 'success', rejected: 'danger',
  confirmed: 'info', in_progress: 'secondary', completed: 'primary', cancelled: 'dark',
};

const BookingHistoryPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    bookingAPI.getAll()
      .then(r => setBookings(r.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const statusCounts = bookings.reduce((acc, b) => {
    acc[b.booking_status] = (acc[b.booking_status] || 0) + 1;
    return acc;
  }, {});

  const filtered = statusFilter === 'all' ? bookings : bookings.filter(b => b.booking_status === statusFilter);

  const statuses = ['all', 'pending', 'accepted', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected'];

  return (
    <>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1a56db,#1140a6)' }} className="text-white py-4">
        <div className="container">
          <h3 className="fw-bold mb-0"><i className="bi bi-clock-history me-2"></i>Booking History</h3>
          <p className="mb-0 opacity-75 small">{bookings.length} total bookings</p>
        </div>
      </div>

      <div className="container py-5">

        {/* Status Filter Pills */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              className={`btn btn-sm rounded-pill px-3 ${statusFilter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.replace('_', ' ')}
              <span className={`ms-1 badge rounded-pill ${statusFilter === s ? 'bg-white text-primary' : 'bg-secondary bg-opacity-25 text-dark'}`}>
                {s === 'all' ? bookings.length : (statusCounts[s] || 0)}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{ width: 48, height: 48 }}></div>
            <p className="mt-3 text-muted">Loading booking history...</p>
          </div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{user?.role === 'worker' ? 'Hotel' : 'Worker'}</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Hours</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.booking_id}>
                      <td className="text-muted small">#{b.booking_id}</td>
                      <td className="fw-semibold">
                        {user?.role === 'worker' ? b.hotel_name : b.worker_name}
                      </td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary border">
                          {b.category_name}
                        </span>
                      </td>
                      <td className="text-muted">{b.booking_date}</td>
                      <td className="text-muted small">{b.start_time} – {b.end_time}</td>
                      <td>{b.total_hours}h</td>
                      <td className="fw-semibold">₹{b.total_amount}</td>
                      <td>
                        <span className={`badge bg-${STATUS_COLORS[b.booking_status]}`}>
                          {b.booking_status?.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-5">
                        <i className="bi bi-calendar-x fs-1 d-block mb-3 opacity-50"></i>
                        No bookings found for this filter.
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

export default BookingHistoryPage;
