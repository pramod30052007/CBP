import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { adminAPI } from '../utils/api';

const STATUS_COLORS = {
  pending: 'warning', accepted: 'success', rejected: 'danger',
  confirmed: 'info', in_progress: 'secondary', completed: 'primary', cancelled: 'dark',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState({ text: '', type: 'success' });
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, bookingsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        adminAPI.getBookings(),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data || []);
      setBookings(bookingsRes.data.data || []);
    } catch (err) {
      console.error('Admin dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: 'success' }), 4000);
  };

  const handleToggleUser = async (userId) => {
    try {
      await adminAPI.toggleUser(userId);
      showMessage('User status updated!');
      loadData();
    } catch (err) {
      showMessage('Failed to update user.', 'danger');
    }
  };

  const handleVerifyWorker = async (workerId, status) => {
    try {
      await adminAPI.verifyWorker(workerId, status);
      showMessage(`Worker ${status} successfully!`);
      loadData();
    } catch (err) {
      showMessage('Failed to update worker.', 'danger');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchRole = !userRoleFilter || u.role === userRoleFilter;
    const matchSearch = !userSearch || u.full_name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    return matchRole && matchSearch;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: 48, height: 48 }}></div>
          <p className="text-muted">Loading admin panel...</p>
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

          {/* ── Admin Sidebar ── */}
          <div className="col-md-2 sidebar py-4 px-2" style={{ background: '#1e293b' }}>
            <div className="text-center mb-4">
              <div className="rounded-circle bg-danger d-flex align-items-center justify-content-center mx-auto mb-2 text-white fw-bold fs-4" style={{ width: 56, height: 56 }}>
                <i className="bi bi-shield-fill"></i>
              </div>
              <div className="fw-bold small text-white">Admin Panel</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Platform Control</div>
            </div>
            <nav className="nav flex-column gap-1">
              {[
                { id: 'overview', icon: 'bi-speedometer2',  label: 'Overview' },
                { id: 'users',    icon: 'bi-people',         label: 'Manage Users' },
                { id: 'bookings', icon: 'bi-calendar-check', label: 'All Bookings' },
                { id: 'workers',  icon: 'bi-person-badge',   label: 'Verify Workers' },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`btn btn-link text-start w-100 d-flex align-items-center gap-2 px-3 py-2 rounded-2 text-decoration-none ${activeTab === tab.id ? 'bg-primary text-white' : 'text-secondary'}`}
                  style={{ transition: 'all 0.2s' }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`bi ${tab.icon}`} style={{ width: 20 }}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* ── Admin Main ── */}
          <div className="col-md-10 py-4 px-4" style={{ background: '#f8fafc' }}>

            {message.text && (
              <div className={`alert alert-${message.type} alert-dismissible d-flex align-items-center gap-2 mb-4`}>
                <i className={`bi ${message.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
                <span>{message.text}</span>
                <button className="btn-close" onClick={() => setMessage({ text: '', type: 'success' })}></button>
              </div>
            )}

            {/* ── Overview ── */}
            {activeTab === 'overview' && stats && (
              <div>
                <h4 className="fw-bold mb-1">🛡️ Admin Dashboard</h4>
                <p className="text-muted mb-4">Platform overview and statistics</p>

                <div className="row g-4 mb-4">
                  {[
                    { label: 'Total Users',           value: stats.total_users,           icon: 'bi-people-fill',       color: 'blue' },
                    { label: 'Total Workers',         value: stats.total_workers,         icon: 'bi-person-badge-fill', color: 'orange' },
                    { label: 'Total Hotels',          value: stats.total_hotels,          icon: 'bi-building-fill',     color: 'green' },
                    { label: 'Total Bookings',        value: stats.total_bookings,        icon: 'bi-calendar-fill',     color: 'purple' },
                    { label: 'Total Revenue',         value: `₹${parseFloat(stats.total_revenue || 0).toFixed(0)}`, icon: 'bi-currency-rupee', color: 'green' },
                    { label: 'Pending Verifications', value: stats.pending_verifications, icon: 'bi-shield-exclamation', color: 'orange' },
                  ].map((s, i) => (
                    <div key={i} className="col-6 col-md-4 col-xl-2">
                      <div className={`stat-card ${s.color} text-center`} style={{ padding: '1rem' }}>
                        <i className={`bi ${s.icon} d-block mb-1`} style={{ fontSize: '1.6rem', opacity: 0.7 }}></i>
                        <div className="stat-value" style={{ fontSize: '1.4rem' }}>{s.value}</div>
                        <div className="stat-label" style={{ fontSize: '0.72rem' }}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Booking Status Breakdown */}
                {stats.bookingsByStatus?.length > 0 && (
                  <div className="card">
                    <div className="card-header"><strong>Bookings by Status</strong></div>
                    <div className="card-body">
                      <div className="row g-3">
                        {stats.bookingsByStatus.map(b => (
                          <div key={b.booking_status} className="col-6 col-md-3">
                            <div className="text-center p-3 rounded-3 bg-light">
                              <div className="fw-bold fs-4">{b.count}</div>
                              <span className={`badge bg-${STATUS_COLORS[b.booking_status]} mt-1`}>
                                {b.booking_status?.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Users ── */}
            {activeTab === 'users' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                  <div>
                    <h4 className="fw-bold mb-0">Manage Users</h4>
                    <p className="text-muted mb-0 small">{filteredUsers.length} users</p>
                  </div>
                  <div className="d-flex gap-2 flex-wrap">
                    <div className="input-group" style={{ width: 220 }}>
                      <span className="input-group-text"><i className="bi bi-search"></i></span>
                      <input className="form-control form-control-sm" placeholder="Search name or email..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
                    </div>
                    <select className="form-select form-select-sm" style={{ width: 160 }} value={userRoleFilter} onChange={e => setUserRoleFilter(e.target.value)}>
                      <option value="">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="hotel_owner">Hotel Owner</option>
                      <option value="worker">Worker</option>
                    </select>
                  </div>
                </div>

                <div className="card">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr><th>#</th><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Joined</th><th>Action</th></tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((u, i) => (
                          <tr key={u.user_id}>
                            <td className="text-muted small">{i + 1}</td>
                            <td className="fw-semibold">{u.full_name}</td>
                            <td className="text-muted small">{u.email}</td>
                            <td className="text-muted small">{u.phone || '—'}</td>
                            <td>
                              <span className={`badge ${u.role === 'admin' ? 'bg-danger' : u.role === 'hotel_owner' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                                {u.role?.replace('_', ' ')}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${u.is_active ? 'bg-success' : 'bg-secondary'}`}>
                                {u.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="text-muted small">{new Date(u.created_at).toLocaleDateString()}</td>
                            <td>
                              {u.role !== 'admin' && (
                                <button
                                  className={`btn btn-sm ${u.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                  onClick={() => handleToggleUser(u.user_id)}
                                >
                                  {u.is_active ? 'Block' : 'Activate'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                          <tr><td colSpan="8" className="text-center text-muted py-4">No users found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── Bookings ── */}
            {activeTab === 'bookings' && (
              <div>
                <h4 className="fw-bold mb-4">All Bookings ({bookings.length})</h4>
                <div className="card">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr><th>#</th><th>Hotel</th><th>Worker</th><th>Category</th><th>Date</th><th>Amount</th><th>Payment</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {bookings.map(b => (
                          <tr key={b.booking_id}>
                            <td className="text-muted">#{b.booking_id}</td>
                            <td className="fw-semibold">{b.hotel_name}</td>
                            <td>{b.worker_name}</td>
                            <td><span className="badge bg-light text-dark border">{b.category_name}</span></td>
                            <td className="text-muted">{b.booking_date}</td>
                            <td className="fw-semibold">₹{b.total_amount}</td>
                            <td>
                              <span className={`badge ${b.payment_status === 'completed' ? 'bg-success' : b.payment_status === 'pending' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                                {b.payment_status || 'pending'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge bg-${STATUS_COLORS[b.booking_status]}`}>
                                {b.booking_status?.replace('_', ' ')}
                              </span>
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

            {/* ── Worker Verification ── */}
            {activeTab === 'workers' && (
              <div>
                <h4 className="fw-bold mb-4">Worker Verification</h4>
                <div className="card">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead>
                        <tr><th>Worker</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr>
                      </thead>
                      <tbody>
                        {users.filter(u => u.role === 'worker').map(u => (
                          <tr key={u.user_id}>
                            <td className="fw-semibold">{u.full_name}</td>
                            <td className="text-muted small">{u.email}</td>
                            <td className="text-muted small">{u.phone || '—'}</td>
                            <td>
                              <span className="badge bg-warning text-dark">Pending Review</span>
                            </td>
                            <td className="d-flex gap-2">
                              <button className="btn btn-success btn-sm" onClick={() => handleVerifyWorker(u.user_id, 'verified')}>
                                <i className="bi bi-shield-check me-1"></i>Verify
                              </button>
                              <button className="btn btn-outline-danger btn-sm" onClick={() => handleVerifyWorker(u.user_id, 'rejected')}>
                                <i className="bi bi-x-circle me-1"></i>Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                        {users.filter(u => u.role === 'worker').length === 0 && (
                          <tr><td colSpan="5" className="text-center text-muted py-4">No workers to verify.</td></tr>
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

export default AdminDashboard;
