import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { workerAPI, bookingAPI, notificationAPI } from '../utils/api';

const STATUS_COLORS = {
  pending: 'warning', accepted: 'success', rejected: 'danger',
  confirmed: 'info', in_progress: 'secondary', completed: 'primary', cancelled: 'dark',
};
const STATUS_ICONS = {
  pending: 'bi-clock', accepted: 'bi-check-circle', rejected: 'bi-x-circle',
  confirmed: 'bi-calendar-check', in_progress: 'bi-play-circle', completed: 'bi-trophy', cancelled: 'bi-dash-circle',
};

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [profileForm, setProfileForm] = useState({
    skills: '', experience_years: '', hourly_rate: '',
    availability: 'available', location: '', city: '', bio: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: 'success' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [profileRes, bookingsRes, notifRes] = await Promise.all([
        workerAPI.getMyProfile(),
        bookingAPI.getAll(),
        notificationAPI.getAll(),
      ]);
      const p = profileRes.data.data;
      setProfile(p);
      setBookings(bookingsRes.data.data || []);
      setNotifications(notifRes.data.data || []);
      if (p) {
        setProfileForm({
          skills: p.skills || '', experience_years: p.experience_years || '',
          hourly_rate: p.hourly_rate || '', availability: p.availability || 'available',
          location: p.location || '', city: p.city || '', bio: p.bio || '',
        });
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'success' }), 4000);
  };

  const handleStatusUpdate = async (bookingId, status) => {
    try {
      await bookingAPI.updateStatus(bookingId, status);
      showMessage(`Booking ${status} successfully!`);
      loadData();
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to update booking.', 'danger');
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(profileForm).forEach(([k, v]) => formData.append(k, v || ''));
      const profileImageInput = document.getElementById('profile_image_input');
      if (profileImageInput?.files[0]) formData.append('profile_image', profileImageInput.files[0]);
      const idDocInput = document.getElementById('id_document_input');
      if (idDocInput?.files[0]) formData.append('id_document', idDocInput.files[0]);
      await workerAPI.updateProfile(formData);
      showMessage('Profile updated successfully!');
      loadData();
    } catch (err) {
      showMessage('Failed to update profile. Please try again.', 'danger');
    } finally {
      setSaving(false);
    }
  };

  const pendingBookings = bookings.filter(b => b.booking_status === 'pending');
  const completedBookings = bookings.filter(b => b.booking_status === 'completed');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div>
          <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }}></div>
          <p className="text-muted text-center">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const SidebarTab = ({ id, icon, label, badge }) => (
    <button
      className={`nav-link btn btn-link text-start w-100 d-flex align-items-center gap-2 px-3 py-2 ${activeTab === id ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      <i className={`bi ${icon}`} style={{ width: 20 }}></i>
      <span>{label}</span>
      {badge > 0 && <span className="badge bg-warning text-dark ms-auto">{badge}</span>}
    </button>
  );

  return (
    <>
      <Navbar />
      <div className="container-fluid px-0">
        <div className="row g-0" style={{ minHeight: 'calc(100vh - 70px)' }}>

          {/* ── Sidebar ── */}
          <div className="col-md-3 col-lg-2 sidebar py-4 px-2" style={{ minHeight: '100%' }}>
            {/* Profile Summary */}
            <div className="text-center mb-4 px-2">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2 text-white fw-bold fs-3"
                style={{ width: 60, height: 60, background: 'linear-gradient(135deg,#1a56db,#f97316)' }}
              >
                {user?.full_name?.charAt(0)}
              </div>
              <div className="fw-bold small">{user?.full_name}</div>
              <div className="text-muted" style={{ fontSize: '0.78rem' }}>{profile?.city || 'Set your city'}</div>
              <span
                className={`badge mt-2 rounded-pill ${profile?.availability === 'available' ? 'bg-success' : profile?.availability === 'busy' ? 'bg-warning text-dark' : 'bg-secondary'}`}
              >
                {profile?.availability || 'offline'}
              </span>
              {profile?.verification_status === 'verified' && (
                <div><span className="badge bg-primary mt-1" style={{ fontSize: '0.68rem' }}><i className="bi bi-shield-check me-1"></i>Verified</span></div>
              )}
            </div>

            <nav className="nav flex-column gap-1">
              <SidebarTab id="overview"       icon="bi-speedometer2"   label="Overview" />
              <SidebarTab id="bookings"       icon="bi-calendar-check" label="My Bookings"    badge={pendingBookings.length} />
              <SidebarTab id="profile"        icon="bi-person-gear"    label="Edit Profile" />
              <SidebarTab id="notifications"  icon="bi-bell"           label="Notifications"  badge={notifications.filter(n => !n.is_read).length} />
              <SidebarTab id="earnings"       icon="bi-currency-rupee" label="Earnings" />
            </nav>
          </div>

          {/* ── Main Content ── */}
          <div className="col-md-9 col-lg-10 py-4 px-4" style={{ background: '#f8fafc' }}>
            {/* Toast Message */}
            {message.text && (
              <div className={`alert alert-${message.type} alert-dismissible d-flex align-items-center gap-2 mb-4`}>
                <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                <span>{message.text}</span>
                <button className="btn-close" onClick={() => setMessage({ text: '', type: 'success' })}></button>
              </div>
            )}

            {/* ── Overview ── */}
            {activeTab === 'overview' && (
              <div>
                <h4 className="fw-bold mb-1">👋 Welcome back, {user?.full_name?.split(' ')[0]}!</h4>
                <p className="text-muted mb-4">Here's your activity summary</p>

                {/* Stat Cards */}
                <div className="row g-4 mb-4">
                  {[
                    { label: 'Total Bookings',   value: bookings.length,          icon: 'bi-calendar',         color: 'blue' },
                    { label: 'Pending Requests', value: pendingBookings.length,   icon: 'bi-clock',            color: 'orange' },
                    { label: 'Jobs Completed',   value: completedBookings.length, icon: 'bi-trophy',           color: 'green' },
                    { label: 'Total Earnings',   value: `₹${totalEarnings.toFixed(0)}`, icon: 'bi-currency-rupee', color: 'purple' },
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

                {/* Profile Completion Alert */}
                {profile?.verification_status !== 'verified' && (
                  <div className="alert alert-warning d-flex align-items-center gap-3 mb-4">
                    <i className="bi bi-shield-exclamation fs-4 flex-shrink-0"></i>
                    <div>
                      <strong>Profile not verified!</strong> Complete your profile and upload ID documents to get verified and appear in search results.
                    </div>
                    <button className="btn btn-sm btn-warning ms-auto" onClick={() => setActiveTab('profile')}>
                      Complete Profile
                    </button>
                  </div>
                )}

                {/* Pending Booking Requests */}
                {pendingBookings.length > 0 && (
                  <div className="card mb-4 border-warning">
                    <div className="card-header bg-warning bg-opacity-10 d-flex align-items-center gap-2">
                      <i className="bi bi-bell-fill text-warning"></i>
                      <strong>New Booking Requests ({pendingBookings.length})</strong>
                    </div>
                    <div className="card-body p-3">
                      {pendingBookings.map(b => (
                        <div key={b.booking_id} className="border rounded-3 p-3 mb-3 bg-white">
                          <div className="row align-items-center g-3">
                            <div className="col-md-8">
                              <h6 className="fw-bold mb-2">
                                <i className="bi bi-building me-2 text-primary"></i>{b.hotel_name}
                              </h6>
                              <div className="d-flex flex-wrap gap-3 text-muted" style={{ fontSize: '0.85rem' }}>
                                <span><i className="bi bi-briefcase me-1"></i>{b.category_name}</span>
                                <span><i className="bi bi-calendar me-1"></i>{b.booking_date}</span>
                                <span><i className="bi bi-clock me-1"></i>{b.start_time} → {b.end_time}</span>
                                <span className="fw-semibold text-dark"><i className="bi bi-currency-rupee me-1"></i>₹{b.total_amount}</span>
                              </div>
                              {b.work_location && (
                                <div className="text-muted mt-1" style={{ fontSize: '0.82rem' }}>
                                  <i className="bi bi-geo-alt me-1"></i>{b.work_location}
                                </div>
                              )}
                            </div>
                            <div className="col-md-4 d-flex gap-2">
                              <button className="btn btn-success btn-sm flex-fill" onClick={() => handleStatusUpdate(b.booking_id, 'accepted')}>
                                <i className="bi bi-check-lg me-1"></i>Accept
                              </button>
                              <button className="btn btn-outline-danger btn-sm flex-fill" onClick={() => handleStatusUpdate(b.booking_id, 'rejected')}>
                                <i className="bi bi-x-lg me-1"></i>Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <strong>Recent Activity</strong>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => setActiveTab('bookings')}>View All</button>
                  </div>
                  {bookings.slice(0, 5).length === 0 ? (
                    <div className="card-body text-center py-5 text-muted">
                      <i className="bi bi-calendar-x fs-1 d-block mb-3 opacity-50"></i>
                      <p>No bookings yet. Hotels will reach out when they need your skills.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead>
                          <tr>
                            <th>Hotel</th><th>Category</th><th>Date</th><th>Amount</th><th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.slice(0, 5).map(b => (
                            <tr key={b.booking_id}>
                              <td className="fw-semibold">{b.hotel_name}</td>
                              <td>
                                <span className="badge bg-primary bg-opacity-10 text-primary">{b.category_name}</span>
                              </td>
                              <td className="text-muted">{b.booking_date}</td>
                              <td className="fw-semibold">₹{b.total_amount}</td>
                              <td>
                                <span className={`badge bg-${STATUS_COLORS[b.booking_status]}`}>
                                  {b.booking_status?.replace('_', ' ')}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Bookings Tab ── */}
            {activeTab === 'bookings' && (
              <div>
                <h4 className="fw-bold mb-4">My Bookings</h4>
                {bookings.length === 0 ? (
                  <div className="card text-center py-5">
                    <i className="bi bi-calendar-x fs-1 text-muted d-block mb-3"></i>
                    <p className="text-muted">No bookings yet.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {bookings.map(b => (
                      <div key={b.booking_id} className="card">
                        <div className="card-body">
                          <div className="row align-items-center g-3">
                            <div className="col-md-8">
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <i className={`bi ${STATUS_ICONS[b.booking_status]} text-${STATUS_COLORS[b.booking_status]} fs-5`}></i>
                                <h6 className="fw-bold mb-0">{b.hotel_name}</h6>
                                <span className={`badge bg-${STATUS_COLORS[b.booking_status]} ms-1`}>
                                  {b.booking_status?.replace('_', ' ')}
                                </span>
                              </div>
                              <div className="d-flex flex-wrap gap-3 text-muted" style={{ fontSize: '0.85rem' }}>
                                <span><i className="bi bi-briefcase me-1"></i>{b.category_name}</span>
                                <span><i className="bi bi-calendar me-1"></i>{b.booking_date}</span>
                                <span><i className="bi bi-clock me-1"></i>{b.start_time} → {b.end_time} ({b.total_hours}h)</span>
                                <span className="fw-semibold text-dark"><i className="bi bi-currency-rupee me-1"></i>₹{b.total_amount}</span>
                              </div>
                            </div>
                            <div className="col-md-4 d-flex gap-2 justify-content-md-end">
                              {b.booking_status === 'pending' && (
                                <>
                                  <button className="btn btn-success btn-sm" onClick={() => handleStatusUpdate(b.booking_id, 'accepted')}>
                                    <i className="bi bi-check me-1"></i>Accept
                                  </button>
                                  <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(b.booking_id, 'rejected')}>
                                    <i className="bi bi-x me-1"></i>Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <div>
                <h4 className="fw-bold mb-4">Edit Worker Profile</h4>
                <div className="card">
                  <div className="card-body p-4">
                    <form onSubmit={handleProfileSave}>
                      <div className="row g-3">
                        <div className="col-md-8">
                          <label className="form-label fw-semibold">Skills <span className="text-muted fw-normal">(comma-separated)</span></label>
                          <input
                            className="form-control"
                            placeholder="e.g. Waiter, Bartender, Event Staff, Food Service"
                            value={profileForm.skills}
                            onChange={e => setProfileForm({ ...profileForm, skills: e.target.value })}
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label fw-semibold">Experience (years)</label>
                          <input
                            type="number" min="0" max="50"
                            className="form-control"
                            value={profileForm.experience_years}
                            onChange={e => setProfileForm({ ...profileForm, experience_years: e.target.value })}
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label fw-semibold">Rate (₹/hr)</label>
                          <input
                            type="number" min="0"
                            className="form-control"
                            value={profileForm.hourly_rate}
                            onChange={e => setProfileForm({ ...profileForm, hourly_rate: e.target.value })}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Availability</label>
                          <select
                            className="form-select"
                            value={profileForm.availability}
                            onChange={e => setProfileForm({ ...profileForm, availability: e.target.value })}
                          >
                            <option value="available">🟢 Available</option>
                            <option value="busy">🟡 Busy</option>
                            <option value="offline">⚫ Offline</option>
                          </select>
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">City</label>
                          <input
                            className="form-control" placeholder="e.g. Bangalore"
                            value={profileForm.city}
                            onChange={e => setProfileForm({ ...profileForm, city: e.target.value })}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">Area / Location</label>
                          <input
                            className="form-control" placeholder="e.g. Koramangala, Bangalore"
                            value={profileForm.location}
                            onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                          />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-semibold">Bio / About Yourself</label>
                          <textarea
                            className="form-control" rows="3"
                            placeholder="Describe your experience, strengths, and what makes you a great hospitality worker..."
                            value={profileForm.bio}
                            onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                          ></textarea>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">Profile Photo</label>
                          <input id="profile_image_input" type="file" className="form-control" accept="image/jpeg,image/png,image/gif" />
                          {profile?.profile_image && (
                            <div className="mt-2">
                              <img src={`http://localhost:5000${profile.profile_image}`} alt="Current" className="rounded-circle" style={{ width: 50, height: 50, objectFit: 'cover' }} />
                              <small className="text-muted ms-2">Current photo</small>
                            </div>
                          )}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-semibold">ID Document <span className="text-muted fw-normal">(Aadhaar/PAN/Passport)</span></label>
                          <input id="id_document_input" type="file" className="form-control" accept=".pdf,image/jpeg,image/png" />
                          <div className="form-text">Upload for profile verification. Supports PDF, JPG, PNG (max 5MB).</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <button type="submit" className="btn btn-primary px-5" disabled={saving}>
                          {saving ? (
                            <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                          ) : (
                            <><i className="bi bi-save me-2"></i>Save Profile</>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* ── Notifications Tab ── */}
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
                        <div
                          key={n.notification_id}
                          className={`d-flex align-items-start gap-3 p-3 border-bottom ${!n.is_read ? 'bg-primary bg-opacity-5' : ''}`}
                        >
                          <div
                            className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{ width: 42, height: 42 }}
                          >
                            <i className="bi bi-bell text-primary"></i>
                          </div>
                          <div className="flex-grow-1">
                            <p className={`mb-1 ${!n.is_read ? 'fw-semibold' : ''}`} style={{ fontSize: '0.9rem' }}>
                              {n.message}
                            </p>
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

            {/* ── Earnings Tab ── */}
            {activeTab === 'earnings' && (
              <div>
                <h4 className="fw-bold mb-4">Earnings Overview</h4>
                <div className="row g-4 mb-4">
                  <div className="col-md-4">
                    <div className="stat-card green text-center">
                      <i className="bi bi-currency-rupee d-block mb-2" style={{ fontSize: '2.5rem', opacity: 0.7 }}></i>
                      <div className="stat-value">₹{totalEarnings.toFixed(0)}</div>
                      <div className="stat-label">Total Earned</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-card blue text-center">
                      <i className="bi bi-trophy d-block mb-2" style={{ fontSize: '2.5rem', opacity: 0.7 }}></i>
                      <div className="stat-value">{completedBookings.length}</div>
                      <div className="stat-label">Jobs Completed</div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-card orange text-center">
                      <i className="bi bi-star d-block mb-2" style={{ fontSize: '2.5rem', opacity: 0.7 }}></i>
                      <div className="stat-value">{profile?.rating ? parseFloat(profile.rating).toFixed(1) : '0.0'}</div>
                      <div className="stat-label">Average Rating</div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header">
                    <strong>Completed Jobs History</strong>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr><th>Hotel</th><th>Category</th><th>Date</th><th>Hours</th><th>Rate</th><th>Amount</th></tr>
                      </thead>
                      <tbody>
                        {completedBookings.map(b => (
                          <tr key={b.booking_id}>
                            <td className="fw-semibold">{b.hotel_name}</td>
                            <td><span className="badge bg-light text-dark border">{b.category_name}</span></td>
                            <td className="text-muted">{b.booking_date}</td>
                            <td>{b.total_hours}h</td>
                            <td className="text-muted">₹{b.hourly_rate}/hr</td>
                            <td className="fw-bold text-success">₹{b.total_amount}</td>
                          </tr>
                        ))}
                        {completedBookings.length === 0 && (
                          <tr>
                            <td colSpan="6" className="text-center text-muted py-4">No completed bookings yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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

export default WorkerDashboard;
