import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { workerAPI, reviewAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const WorkerProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [worker, setWorker] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([workerAPI.getById(id), reviewAPI.getByWorker(id)])
      .then(([wRes, rRes]) => {
        setWorker(wRes.data.data);
        setReviews(rRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

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

  const renderStars = (rating) => {
    const r = Math.round(parseFloat(rating) || 0);
    return Array.from({ length: 5 }, (_, i) => (
      <i key={i} className={`bi bi-star${i < r ? '-fill' : ''} text-warning`}></i>
    ));
  };

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row g-4">

          {/* ── Profile Card ── */}
          <div className="col-md-4">
            <div className="card p-4 text-center sticky-top" style={{ top: 80 }}>
              {worker.profile_image ? (
                <img
                  src={`http://localhost:5000${worker.profile_image}`}
                  alt={worker.full_name}
                  className="rounded-circle mx-auto mb-3"
                  style={{ width: 120, height: 120, objectFit: 'cover', border: '4px solid #1a56db' }}
                />
              ) : (
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold"
                  style={{ width: 120, height: 120, fontSize: '3rem' }}
                >
                  {worker.full_name?.charAt(0)}
                </div>
              )}

              <h4 className="fw-bold mb-1">{worker.full_name}</h4>
              <p className="text-muted mb-2"><i className="bi bi-geo-alt me-1"></i>{worker.city || 'Location not set'}</p>

              <div className="mb-2">
                <span
                  className={`badge rounded-pill px-3 py-2 ${worker.availability === 'available' ? 'bg-success' : worker.availability === 'busy' ? 'bg-warning text-dark' : 'bg-secondary'}`}
                >
                  {worker.availability === 'available' ? '🟢' : worker.availability === 'busy' ? '🟡' : '⚫'} {worker.availability}
                </span>
              </div>

              {worker.verification_status === 'verified' && (
                <div className="mb-3">
                  <span className="badge bg-success"><i className="bi bi-shield-check me-1"></i>Verified Worker</span>
                </div>
              )}

              <div className="d-flex justify-content-center gap-1 mb-3">
                {renderStars(worker.rating)}
                <span className="text-muted ms-1 small">({worker.total_reviews})</span>
              </div>

              <div className="border-top pt-3 text-start">
                {[
                  { label: 'Hourly Rate', value: `₹${worker.hourly_rate}/hr`, color: 'text-primary fw-bold' },
                  { label: 'Experience', value: `${worker.experience_years} years` },
                  { label: 'Jobs Done', value: `${worker.total_reviews} completed` },
                ].map(item => (
                  <div key={item.label} className="d-flex justify-content-between mb-2">
                    <span className="text-muted small">{item.label}</span>
                    <span className={`small ${item.color || ''}`}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              {user?.role === 'hotel_owner' && (
                <Link to={`/book/${worker.worker_id}`} className="btn btn-primary w-100 mt-3 py-2 fw-semibold">
                  <i className="bi bi-calendar-plus me-2"></i>Book Now
                </Link>
              )}
              {!user && (
                <Link to="/login" className="btn btn-outline-primary w-100 mt-3">
                  <i className="bi bi-lock me-2"></i>Login to Book
                </Link>
              )}
            </div>
          </div>

          {/* ── Details ── */}
          <div className="col-md-8">
            {/* Bio */}
            <div className="card mb-4">
              <div className="card-header">
                <strong><i className="bi bi-person me-2 text-primary"></i>About {worker.full_name}</strong>
              </div>
              <div className="card-body">
                <p className="text-muted">{worker.bio || 'No bio provided yet.'}</p>
                {worker.skills && (
                  <div className="mt-3">
                    <div className="fw-semibold mb-2 small text-muted">SKILLS & EXPERTISE</div>
                    <div>
                      {worker.skills.split(',').map(s => (
                        <span key={s} className="badge bg-primary bg-opacity-10 text-primary border me-2 mb-2 px-3 py-2">
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <strong><i className="bi bi-star me-2 text-warning"></i>Reviews ({reviews.length})</strong>
                {reviews.length > 0 && (
                  <span className="text-muted small">
                    Avg: {renderStars(worker.rating)} {parseFloat(worker.rating || 0).toFixed(1)}/5
                  </span>
                )}
              </div>
              <div className="card-body p-0">
                {reviews.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-chat-left-text fs-1 d-block mb-3 opacity-50"></i>
                    <p>No reviews yet. Be the first to book and review!</p>
                  </div>
                ) : (
                  reviews.map(r => (
                    <div key={r.review_id} className="p-4 border-bottom">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="fw-semibold">{r.hotel_name}</div>
                        <div className="d-flex gap-1">{renderStars(r.rating)}</div>
                      </div>
                      {r.comments && <p className="text-muted small mb-1">"{r.comments}"</p>}
                      <small className="text-muted">{new Date(r.created_at).toLocaleDateString()}</small>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default WorkerProfilePage;
