import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.success) {
        const { role } = data.user;
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'hotel_owner') navigate('/hotel/dashboard');
        else navigate('/worker/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      admin:  { email: 'admin@workerbook.com', password: 'Admin@123'  },
      hotel:  { email: 'owner@grandhotel.com', password: 'Owner@123'  },
      worker: { email: 'raj@worker.com',       password: 'Worker@123' },
    };
    setForm(demos[role]);
    setError('');
  };

  return (
    <div className="min-vh-100 d-flex" style={{ background: 'linear-gradient(135deg,#1a56db10,#f9731610)' }}>

      {/* ── Left Panel ── */}
      <div
        className="d-none d-lg-flex col-lg-6 align-items-center justify-content-center flex-column text-white p-5"
        style={{ background: 'linear-gradient(135deg, #1a56db, #1140a6)' }}
      >
        <div className="text-center" style={{ maxWidth: 400 }}>
          <div className="rounded-3 bg-white bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-4" style={{ width: 80, height: 80 }}>
            <i className="bi bi-buildings-fill display-5"></i>
          </div>
          <h2 className="fw-bold mb-3">Worker<span className="text-warning">Book</span></h2>
          <p className="lead opacity-85 mb-5">Your trusted platform for hotel staffing solutions</p>
          <div className="row g-3">
            {['Verified Workers', 'Instant Booking', 'Secure Payments', '24/7 Support'].map(f => (
              <div key={f} className="col-6">
                <div className="bg-white bg-opacity-10 rounded-3 p-3">
                  <i className="bi bi-check-circle-fill text-warning me-2"></i>
                  <span style={{ fontSize: '0.9rem' }}>{f}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="col-12 col-lg-6 d-flex align-items-center justify-content-center p-4">
        <div className="w-100" style={{ maxWidth: 420 }}>

          {/* Logo (mobile only) */}
          <div className="text-center mb-4 d-lg-none">
            <Link to="/" className="text-decoration-none">
              <h3 className="fw-bold">Worker<span className="text-warning">Book</span></h3>
            </Link>
          </div>

          <div className="text-center mb-4">
            <h4 className="fw-bold">Welcome Back!</h4>
            <p className="text-muted">Sign in to your account to continue</p>
          </div>

          {/* Demo Quick-fill */}
          <div className="d-flex gap-2 mb-4 flex-wrap align-items-center">
            <small className="text-muted fw-semibold">Try demo:</small>
            {[['admin', 'Admin'], ['hotel', 'Hotel Owner'], ['worker', 'Worker']].map(([k, l]) => (
              <button key={k} type="button" className="btn btn-outline-primary btn-sm py-1" onClick={() => fillDemo(k)}>
                {l}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger alert-dismissible d-flex align-items-center gap-2" role="alert">
              <i className="bi bi-exclamation-circle-fill"></i>
              <span>{error}</span>
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Email Address</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-envelope text-muted"></i></span>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-lock text-muted"></i></span>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="input-group-text" onClick={() => setShowPass(!showPass)}>
                  <i className={`bi bi-eye${showPass ? '-slash' : ''} text-muted`}></i>
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Logging in...</>
              ) : (
                <><i className="bi bi-box-arrow-in-right me-2"></i>Login</>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-muted mb-3">Don't have an account?</p>
            <div className="d-flex gap-2 justify-content-center">
              <Link to="/register/worker" className="btn btn-outline-secondary btn-sm px-3">
                <i className="bi bi-person-badge me-1"></i>Join as Worker
              </Link>
              <Link to="/register/hotel" className="btn btn-outline-primary btn-sm px-3">
                <i className="bi bi-building me-1"></i>Join as Hotel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
