import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { hotelAPI, bookingAPI, notificationAPI } from '../utils/api';

const STATUS_COLORS = {
  pending: 'warning', accepted: 'success', rejected: 'danger',
  confirmed: 'info', in_progress: 'secondary', completed: 'primary', cancelled: 'dark',
};

const HotelDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [hotelForm, setHotelForm] = useState({
    hotel_name: '', address: '', city: '', state: '', pincode: '',
    contact_number: '', email: '', description: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'success' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [hotelRes, bookingsRes, notifRes] = await Promise.all([
        hotelAPI.getMyHotel(),
        bookingAPI.getAll(),
        notificationAPI.getAll(),
      ]);
      const h = hotelRes.data.data;
      setHotel(h);
      setBookings(bookingsRes.data.data || []);
      setNotifications(notifRes.data.data || []);
      if (h) {
        setHotelForm({
          hotel_name: h.hotel_name || '', address: h.address || '',
          city: h.city || '', state: h.state || '', pincode: h.pincode || '',
          contact_number: h.contact_number || '', email: h.email || '', description: h.description || '',
        });
      }
    } catch (err) {
      console.error('Hotel dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'success' }), 4000);
  };

  const handleHotelSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await hotelAPI.create(hotelForm);
      showMessage('Hotel profile saved successfully!');
      loadData();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to save hotel profile.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingAPI.updateStatus(bookingId, 'cancelled');
      showMessage('Booking cancelled.');
      loadData();
    } catch (err) {
      showMessage('Failed to cancel booking.', 'danger');
    }
  };

  const totalSpent = bookings.filter(b => b.booking_status === 'completed').reduce((s, b) => s + parseFloat(b.total_amount || 0), 0);
  const activeBookings = bookings.filter(b => ['pending', 'accepted', 'confirmed', 'in_progress'].includes(b.booking_status));

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }}></div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const SidebarTab = ({ id, icon, label }) => (
    <button
      className={`nav-link btn btn-link text-start w-100 d-flex align-items-center gap-2 px-3 py-2 ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      <i className={`bi ${icon}`} style={{ width: 20 }}></i>
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <Navbar />
      <div className="container-fluid px-0">
        <div className="row g-0" style={{ minHeight: 'calc(100vh - 70px)' }}>

          {/* ── Sidebar ── */}
          <div className="col-md-3 col-lg-2 sidebar py-4 px-2">
            <div className="text-center mb-4 px-2">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 text-white fw-bold fs-3"
                style={{ width: 60, height: 60, background: 'linear-gradient(135deg,#f97316,#1a56db)' }}
              >
                {hotel?.hotel_name?.charAt(0) || user?.full_name?.charAt(0)}
              </div>
              <div className="fw-bold small">{hotel?.hotel_name || user?.full_name}</div>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>{hotel?.city || 'Setup hotel profile'}</div>
              {hotel?.is_verified ? (
                <span className="badge bg-success mt-1" style={{ fontSize: '0.68rem' }}><i className="bi bi-shield-check me-1"></i>Verified</span>
              ) : (
                <span className="badge bg-warning text-dark mt-1" style={{ fontSize: '0.68rem' }}>Pending Verification</span>
              )}
            </div>

            <nav className="nav flex-column gap-1">
              <SidebarTab id="overview"       icon="bi-speedometer2"   label="Overview" />
              <SidebarTab id="bookings"       icon="bi-calendar-check" label="All Bookings" />
              <SidebarTab id="hotel-profile"  icon="bi-building-gear"  label="Hotel Profile" />
              <SidebarTab id="notifications"  icon="bi-bell"           label="Notifications" />
            </nav>

            <hr className="mx-3" />
            <button
              className="nav-link btn btn-link text-start w-100 d-flex align-items-center gap-2 px-3 py-2 text-primary"
              onClick={() => navigate('/find-workers')}
            >
              <i className="bi bi-search" style={{ width: 20 }}></i>
              <span>Find Workers</span>
            </button>
          </div>

          {/* ── Main ── */}
          <div className="col-md-9 col-lg-10 py-4 px-4" style={{ background: '#f8fafc' }}>

            {/* Toast */}
            {message.text && (
              <div className={`alert alert-${message.type} alert-dismissible d-flex align-items-center gap-2 mb-4`}>
                <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                <span>{message.text}</span>
                <button className="btn-close" onClick={() => setMessage({ text: '', type: 'success' })}></button>
              </div>
            )}

            {/* Hotel setup prompt */}
            {!hotel && activeTab === 'overview' && (
              <div className="alert alert-info d-flex align-items-center gap-3 mb-4">
                <i className="bi bi-info-circle-fill fs-4 flex-shrink-0"></i>
                <div>
                  <strong>Welcome!</strong> Please set up your hotel profile before you can book workers.
                </div>
                <button className="btn btn-primary btn-sm ms-auto" onClick={() => setActiveTab('hotel-profile')}>
                  Setup Hotel Profile
                </button>
              </div>
            )}

            {/* ── Overview ── */}
            {activeTab === 'overview' && (
              <div>
                <h4 className="fw-bold mb-1">🏨 Hotel Dashboard</h4>
                <p className="text-muted mb-4">Manage your bookings and workers</p>

                <div className="row g-4 mb-4">
                  {[
                    { label: 'Total Bookings',  value: bookings.length,          icon: 'bi-calendar',       color: 'blue' },
                    { label: 'Active Bookings', value: activeBookings.length,    icon: 'bi-clock',          color: 'orange' },
                    { label: 'Completed',       value: bookings.filter(b => b.booking_status === 'completed').length, icon: 'bi-check-circle', color: 'green' },
                    { label: 'Total Spent',     value: `₹${totalSpent.toFixed(0)}`, icon: 'bi-currency-rupee', color: 'purple' },
                  ].map((s, i) => (
                    <div key={i} className="col-6 col-xl-3">
                      <div className={`stat-card ${s.color} d-flex align-items-center gap-3`}>
                        <i className={`bi ${s.icon}`} style={{ fontSize: '2rem', opacity: 0.7 }}></i>
                        <div>
                          <div className="stat-value">{s.value}</div>
                          <div className="stat-label">{s.label}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">Recent Bookings</h5>
                  <Link to="/find-workers" className="btn btn-primary btn-sm">
                    <i className="bi bi-plus me-1"></i>Book a Worker
                  </Link>
                </div>

                <div className="card">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr><th>Worker</th><th>Category</th><th>Date</th><th>Hours</th><th>Amount</th><th>Status</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 10).map(b => (
                          <tr key={b.booking_id}>
                            <td className="fw-semibold">{b.worker_name}</td>
                            <td><span className="badge bg-primary bg-opacity-10 text-primary">{b.category_name}</span></td>
                            <td className="text-muted">{b.booking_date}</td>
                            <td>{b.total_hours}h</td>
                            <td className="fw-semibold">₹{b.total_amount}</td>
                            <td><span className={`badge bg-${STATUS_COLORS[b.booking_status]}`}>{b.booking_status?.replace('_', ' ')}</span></td>
                            <td>
                              {['pending', 'accepted'].includes(b.booking_status) && (
                                <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancelBooking(b.booking_id)}>Cancel</button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {bookings.length === 0 && (
                          <tr>
                            <td colSpan="7" className="text-center text-muted py-5">
                              No bookings yet. <Link to="/find-workers">Find Workers</Link> to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── All Bookings ── */}
            {activeTab === 'bookings' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold mb-0">All Bookings ({bookings.length})</h4>
                  <Link to="/find-workers" className="btn btn-primary">
                    <i className="bi bi-plus me-1"></i>New Booking
                  </Link>
                </div>
                <div className="card">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr><th>#</th><th>Worker</th><th>Category</th><th>Date</th><th>Time</th><th>Amount</th><th>Status</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        {bookings.map(b => (
                          <tr key={b.booking_id}>
                            <td className="text-muted">#{b.booking_id}</td>
                            <td className="fw-semibold">{b.worker_name}</td>
                            <td>{b.category_name}</td>
                            <td className="text-muted">{b.booking_date}</td>
                            <td className="text-muted small">{b.start_time} – {b.end_time}</td>
                            <td className="fw-semibold">₹{b.total_amount}</td>
                            <td><span className={`badge bg-${STATUS_COLORS[b.booking_status]}`}>{b.booking_status?.replace('_', ' ')}</span></td>
                            <td>
                              {['pending', 'accepted'].includes(b.booking_status) && (
                                <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancelBooking(b.booking_id)}>Cancel</button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {bookings.length === 0 && (
                          <tr><td colSpan="8" className="text-center text-muted py-4">No bookings found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Hotel Profile ── */}
            {activeTab === 'hotel-profile' && (
              <div>
                <h4 className="fw-bold mb-4">Hotel Profile</h4>
                <div className="card">
                  <div className="card-body p-4">
                    <form onSubmit={handleHotelSave}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Hotel Name *</label>
                          <input className="form-control" placeholder="Grand Palace Hotel" value={hotelForm.hotel_name} onChange={e => setHotelForm({ ...hotelForm, hotel_name: e.target.value })} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Contact Number</label>
                          <input className="form-control" placeholder="080-12345678" value={hotelForm.contact_number} onChange={e => setHotelForm({ ...hotelForm, contact_number: e.target.value })} />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold">Full Address *</label>
                          <input className="form-control" placeholder="123 MG Road, Sector 5" value={hotelForm.address} onChange={e => setHotelForm({ ...hotelForm, address: e.target.value })} required />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">City *</label>
                          <input className="form-control" placeholder="Bangalore" value={hotelForm.city} onChange={e => setHotelForm({ ...hotelForm, city: e.target.value })} required />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">State</label>
                          <input className="form-control" placeholder="Karnataka" value={hotelForm.state} onChange={e => setHotelForm({ ...hotelForm, state: e.target.value })} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Pincode</label>
                          <input className="form-control" placeholder="560001" value={hotelForm.pincode} onChange={e => setHotelForm({ ...hotelForm, pincode: e.target.value })} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Hotel Email</label>
                          <input type="email" className="form-control" placeholder="info@hotel.com" value={hotelForm.email} onChange={e => setHotelForm({ ...hotelForm, email: e.target.value })} />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold">Description</label>
                          <textarea className="form-control" rows="3" placeholder="Tell workers about your hotel..." value={hotelForm.description} onChange={e => setHotelForm({ ...hotelForm, description: e.target.value })}></textarea>
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary mt-4 px-5" disabled={saving}>
                        {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</> : <><i className="bi bi-save me-2"></i>Save Hotel Profile</>}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* ── Notifications ── */}
            {activeTab === 'notifications' && (
              <div>
                <h4 className="fw-bold mb-4">Notifications</h4>
                <div className="card">
                  <div className="card-body p-0">
                    {notifications.length === 0 ? (
                      <div className="text-center py-5 text-muted">
                        <i className="bi bi-bell-slash fs-1 d-block mb-3 opacity-50"></i>
                        <p>No notifications yet.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.notification_id} className={`d-flex align-items-start gap-3 p-3 border-bottom ${!n.is_read ? 'bg-primary bg-opacity-5' : ''}`}>
                          <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 42, height: 42 }}>
                            <i className="bi bi-bell text-primary"></i>
                          </div>
                          <div className="flex-grow-1">
                            <p className={`mb-1 ${!n.is_read ? 'fw-semibold' : ''}`} style={{ fontSize: '0.9rem' }}>{n.message}</p>
                            <small className="text-muted">{new Date(n.created_at).toLocaleString()}</small>
                          </div>
                          {!n.is_read && <span className="badge bg-primary flex-shrink-0">New</span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HotelDashboard;
