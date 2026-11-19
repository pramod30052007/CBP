import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { workerAPI, bookingAPI, categoryAPI } from '../utils/api';

const SHIFT_OPTIONS = [
  { label: '2 Hours', hours: 2, icon: 'bi-lightning' },
  { label: '4 Hours', hours: 4, icon: 'bi-clock' },
  { label: '6 Hours', hours: 6, icon: 'bi-clock-history' },
  { label: '8 Hours', hours: 8, icon: 'bi-sun' },
  { label: 'Custom',  hours: 0, icon: 'bi-pencil' },
];

const BookingPage = () => {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [worker, setWorker] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [selectedShift, setSelectedShift] = useState(4);
  const [form, setForm] = useState({
    category_id: '',
    booking_date: '',
    start_time: '09:00',
    end_time: '13:00',
    workers_required: 1,
    work_location: '',
    special_instructions: '',
    hourly_rate: '',
  });

  useEffect(() => {
    Promise.all([workerAPI.getById(workerId), categoryAPI.getAll()])
      .then(([wRes, cRes]) => {
        setWorker(wRes.data.data);
        setCategories(cRes.data.data || []);
        setForm(f => ({ ...f, hourly_rate: wRes.data.data?.hourly_rate || '' }));
      })
      .catch(err => setError('Could not load worker details.'))
      .finally(() => setLoading(false));
  }, [workerId]);

  const calculateEndTime = (start, hours) => {
    if (!start || hours <= 0) return start;
    const [h, m] = start.split(':').map(Number);
    const totalMins = h * 60 + m + hours * 60;
    return `${String(Math.floor(totalMins / 60) % 24).padStart(2, '0')}:${String(totalMins % 60).padStart(2, '0')}`;
  };

  const handleShiftSelect = (hours) => {
    setSelectedShift(hours);
    if (hours > 0) {
      setForm(f => ({ ...f, end_time: calculateEndTime(f.start_time, hours) }));
    }
  };

  const handleStartTimeChange = (val) => {
    setForm(f => ({ ...f, start_time: val, end_time: selectedShift > 0 ? calculateEndTime(val, selectedShift) : f.end_time }));
  };

  const getTotalHours = () => {
    if (!form.start_time || !form.end_time) return 0;
    const diff = new Date(`2000-01-01 ${form.end_time}`) - new Date(`2000-01-01 ${form.start_time}`);
    return Math.max(0, diff / (1000 * 60 * 60));
  };

  const getTotalAmount = () => {
    return (getTotalHours() * parseFloat(form.hourly_rate || 0) * parseInt(form.workers_required || 1)).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.category_id) return setError('Please select a job category.');
    if (!form.booking_date) return setError('Please select a booking date.');
    if (getTotalHours() <= 0) return setError('End time must be after start time.');
    if (parseFloat(form.hourly_rate) <= 0) return setError('Hourly rate must be greater than 0.');
    setSubmitting(true);
    try {
      const res = await bookingAPI.create({ ...form, worker_id: parseInt(workerId) });
      setSuccess(`✅ Booking sent! Total: ₹${res.data.total_amount}. The worker will respond to your request soon.`);
      setTimeout(() => navigate('/hotel/dashboard'), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" style={{ width: 48, height: 48 }}></div>
      </div>
    );
  }

  if (!worker) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger"><i className="bi bi-exclamation-circle me-2"></i>Worker not found.</div>
        </div>
        <Footer />
      </>
    );
  }

  const totalHours = getTotalHours();
  const totalAmount = getTotalAmount();

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row g-4">

          {/* ── Worker Info Card ── */}
          <div className="col-md-4">
            <div className="card p-4 sticky-top" style={{ top: 80 }}>
              <div className="text-center mb-3">
                {worker.profile_image ? (
                  <img src={`http://localhost:5000${worker.profile_image}`} alt={worker.full_name} className="rounded-circle mb-3" style={{ width: 100, height: 100, objectFit: 'cover', border: '3px solid #1a56db' }} />
                ) : (
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold" style={{ width: 100, height: 100, fontSize: '2.5rem' }}>
                    {worker.full_name?.charAt(0)}
                  </div>
                )}
                <h5 className="fw-bold mb-1">{worker.full_name}</h5>
                <p className="text-muted small mb-2"><i className="bi bi-geo-alt me-1"></i>{worker.city}</p>
                {worker.verification_status === 'verified' && (
                  <span className="badge bg-success mb-2"><i className="bi bi-shield-check me-1"></i>Verified Worker</span>
                )}
              </div>

              <div className="border-top pt-3">
                {[
                  { label: 'Hourly Rate', value: `₹${worker.hourly_rate}/hr`, color: 'text-primary' },
                  { label: 'Experience', value: `${worker.experience_years} years` },
                  { label: 'Rating', value: `${'★'.repeat(Math.round(worker.rating || 0))} (${worker.total_reviews})`, color: 'text-warning' },
                  { label: 'Status', value: worker.availability },
                ].map(item => (
                  <div key={item.label} className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">{item.label}</span>
                    <span className={`fw-semibold small ${item.color || ''}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              {worker.skills && (
                <div className="mt-3 border-top pt-3">
                  <div className="text-muted small fw-semibold mb-2">SKILLS</div>
                  <div>
                    {worker.skills.split(',').map(s => (
                      <span key={s} className="badge bg-primary bg-opacity-10 text-primary border me-1 mb-1">{s.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Summary */}
              {totalHours > 0 && (
                <div className="card border-primary border-2 mt-3 p-3" style={{ background: '#1a56db08' }}>
                  <div className="fw-bold text-primary mb-2 small">BOOKING SUMMARY</div>
                  <div className="d-flex justify-content-between small mb-1"><span>Hours</span><span>{totalHours.toFixed(1)}h</span></div>
                  <div className="d-flex justify-content-between small mb-1"><span>Rate</span><span>₹{form.hourly_rate}/hr</span></div>
                  <div className="d-flex justify-content-between small mb-1"><span>Workers</span><span>×{form.workers_required}</span></div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total</span>
                    <span className="text-primary fs-5">₹{totalAmount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Booking Form ── */}
          <div className="col-md-8">
            <div className="card">
              <div className="card-header" style={{ background: 'linear-gradient(135deg,#1a56db,#1140a6)', color: 'white' }}>
                <h5 className="mb-0"><i className="bi bi-calendar-plus me-2"></i>Book {worker.full_name}</h5>
              </div>
              <div className="card-body p-4">

                {success && (
                  <div className="alert alert-success d-flex align-items-center gap-2">
                    <i className="bi bi-check-circle-fill flex-shrink-0"></i>
                    <span>{success}</span>
                  </div>
                )}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2">
                    <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
                    <span>{error}</span>
                    <button className="btn-close ms-auto" onClick={() => setError('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Shift Options */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold">Select Shift Duration</label>
                    <div className="d-flex gap-2 flex-wrap">
                      {SHIFT_OPTIONS.map(opt => (
                        <button
                          key={opt.label}
                          type="button"
                          className={`btn btn-sm px-3 py-2 ${selectedShift === opt.hours ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => handleShiftSelect(opt.hours)}
                        >
                          <i className={`bi ${opt.icon} me-1`}></i>{opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Job Category *</label>
                      <select className="form-select" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Booking Date *</label>
                      <input type="date" className="form-control" value={form.booking_date} min={new Date().toISOString().split('T')[0]} onChange={e => setForm({ ...form, booking_date: e.target.value })} required />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Start Time *</label>
                      <input type="time" className="form-control" value={form.start_time} onChange={e => handleStartTimeChange(e.target.value)} required />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">End Time *</label>
                      <input type="time" className="form-control" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} required />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Workers Needed</label>
                      <input type="number" className="form-control" min="1" max="20" value={form.workers_required} onChange={e => setForm({ ...form, workers_required: e.target.value })} />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Hourly Rate (₹)</label>
                      <div className="input-group">
                        <span className="input-group-text fw-bold">₹</span>
                        <input type="number" min="0" step="10" className="form-control" placeholder={worker.hourly_rate} value={form.hourly_rate} onChange={e => setForm({ ...form, hourly_rate: e.target.value })} />
                        <span className="input-group-text">/hr</span>
                      </div>
                      <div className="form-text">Worker's default rate: ₹{worker.hourly_rate}/hr</div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Work Location</label>
                      <input className="form-control" placeholder="e.g. Grand Palace Hotel, Main Banquet Hall" value={form.work_location} onChange={e => setForm({ ...form, work_location: e.target.value })} />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">Special Instructions</label>
                      <textarea className="form-control" rows="2" placeholder="Dress code, specific tasks, entry instructions..." value={form.special_instructions} onChange={e => setForm({ ...form, special_instructions: e.target.value })}></textarea>
                    </div>
                  </div>

                  <div className="d-flex gap-3 mt-4">
                    <button type="submit" className="btn btn-primary px-5 py-2 fw-semibold" disabled={submitting || !!success}>
                      {submitting ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Sending Request...</>
                      ) : (
                        <><i className="bi bi-send me-2"></i>Confirm Booking</>
                      )}
                    </button>
                    <button type="button" className="btn btn-outline-secondary px-4" onClick={() => navigate(-1)}>
                      <i className="bi bi-arrow-left me-1"></i>Back
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BookingPage;
