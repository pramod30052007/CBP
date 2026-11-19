import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const WorkerRegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm_password) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const data = await register({ ...form, role: 'worker' });
      if (data.success) navigate('/worker/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'full_name',         label: 'Full Name',       type: 'text',     icon: 'bi-person',      placeholder: 'Your full name' },
    { name: 'email',             label: 'Email Address',   type: 'email',    icon: 'bi-envelope',    placeholder: 'your@email.com' },
    { name: 'phone',             label: 'Phone Number',    type: 'tel',      icon: 'bi-telephone',   placeholder: '+91 98765 43210' },
    { name: 'password',          label: 'Password',        type: 'password', icon: 'bi-lock',        placeholder: 'Min. 6 characters' },
    { name: 'confirm_password',  label: 'Confirm Password',type: 'password', icon: 'bi-lock-fill',   placeholder: 'Repeat password' },
  ];

  return (
    <>
      <Navbar />
      <div
        className="min-vh-100 d-flex align-items-center py-5"
        style={{ background: 'linear-gradient(135deg,#1a56db10,#f9731610)' }}
      >
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg p-4 border-0">
                {/* Header */}
                <div className="text-center mb-4">
                  <div
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                    style={{ width: 72, height: 72, background: '#1a56db18' }}
                  >
                    <i className="bi bi-person-badge text-primary fs-2"></i>
                  </div>
                  <h3 className="fw-bold">Join as Worker</h3>
                  <p className="text-muted">Create your professional worker profile</p>
                </div>

                {error && (
                  <div className="alert alert-danger alert-dismissible d-flex align-items-center gap-2">
                    <i className="bi bi-exclamation-circle-fill"></i>
                    <span>{error}</span>
                    <button className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {fields.map(field => (
                    <div className="mb-3" key={field.name}>
                      <label className="form-label fw-semibold small">{field.label}</label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className={`bi ${field.icon} text-muted`}></i>
                        </span>
                        <input
                          type={field.type}
                          name={field.name}
                          className="form-control"
                          placeholder={field.placeholder}
                          value={form[field.name]}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  ))}

                  <div className="form-check mb-4">
                    <input className="form-check-input" type="checkbox" id="terms" required />
                    <label className="form-check-label small" htmlFor="terms">
                      I agree to the <a href="#" className="text-primary">Terms & Conditions</a> and <a href="#" className="text-primary">Privacy Policy</a>
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Creating Account...</>
                    ) : (
                      <><i className="bi bi-person-plus me-2"></i>Create Worker Account</>
                    )}
                  </button>
                </form>

                <p className="text-center mt-4 text-muted small mb-0">
                  Already have an account? <Link to="/login" className="text-primary fw-semibold">Login</Link>
                </p>
                <p className="text-center mt-2 text-muted small mb-0">
                  Registering as hotel? <Link to="/register/hotel" className="text-warning fw-semibold">Hotel Registration</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WorkerRegisterPage;
