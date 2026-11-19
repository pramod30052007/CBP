import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { workerAPI, categoryAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const FindWorkersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [workers, setWorkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    search: searchParams.get('category') || '',
    min_rate: '',
    max_rate: '',
    availability: '',
  });

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.data || []));
    loadWorkers(filters);
  }, []); // eslint-disable-line

  const loadWorkers = async (f = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (f.city) params.city = f.city;
      if (f.search) params.search = f.search;
      if (f.min_rate) params.min_rate = f.min_rate;
      if (f.max_rate) params.max_rate = f.max_rate;
      if (f.availability) params.availability = f.availability;
      const r = await workerAPI.getAll(params);
      setWorkers(r.data.data || []);
    } catch (err) {
      console.error('Find workers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  const handleSearch = (e) => { e.preventDefault(); loadWorkers(); };

  const clearFilters = () => {
    const f = { city: '', search: '', min_rate: '', max_rate: '', availability: '' };
    setFilters(f);
    loadWorkers(f);
  };

  const renderStars = (rating) => {
    const r = Math.round(parseFloat(rating) || 0);
    return (
      <span style={{ color: '#f59e0b', letterSpacing: 1 }}>
        {'★'.repeat(r)}{'☆'.repeat(5 - r)}
      </span>
    );
  };

  return (
    <>
      <Navbar />

      {/* ── Header & Search ── */}
      <div style={{ background: 'linear-gradient(135deg, #1a56db, #1140a6)' }} className="text-white py-5">
        <div className="container">
          <h2 className="fw-bold mb-1">Find Local Workers</h2>
          <p className="mb-4" style={{ opacity: 0.85 }}>Search verified hospitality professionals in your city</p>
          <form onSubmit={handleSearch}>
            <div className="row g-2">
              <div className="col-md-4">
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                  <input className="form-control" placeholder="Search by name or skill..." value={filters.search} onChange={e => handleFilterChange('search', e.target.value)} />
                </div>
              </div>
              <div className="col-md-3">
                <div className="input-group">
                  <span className="input-group-text"><i className="bi bi-geo-alt"></i></span>
                  <input className="form-control" placeholder="City" value={filters.city} onChange={e => handleFilterChange('city', e.target.value)} />
                </div>
              </div>
              <div className="col-md-2">
                <select className="form-select" value={filters.availability} onChange={e => handleFilterChange('availability', e.target.value)}>
                  <option value="">All Status</option>
                  <option value="available">🟢 Available</option>
                  <option value="busy">🟡 Busy</option>
                </select>
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-warning w-100 fw-semibold text-dark">
                  <i className="bi bi-search me-1"></i>Search
                </button>
              </div>
              <div className="col-md-1">
                <button type="button" className="btn btn-outline-light w-100" onClick={clearFilters} title="Clear filters">
                  <i className="bi bi-x-circle"></i>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-4">

          {/* ── Filters Sidebar ── */}
          <div className="col-md-3">
            <div className="card p-3 sticky-top" style={{ top: 80 }}>
              <h6 className="fw-bold mb-3"><i className="bi bi-funnel me-2 text-primary"></i>Filters</h6>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">HOURLY RATE</label>
                <div className="row g-2">
                  <div className="col-6">
                    <input type="number" className="form-control form-control-sm" placeholder="Min ₹" value={filters.min_rate} onChange={e => handleFilterChange('min_rate', e.target.value)} />
                  </div>
                  <div className="col-6">
                    <input type="number" className="form-control form-control-sm" placeholder="Max ₹" value={filters.max_rate} onChange={e => handleFilterChange('max_rate', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-muted">JOB CATEGORY</label>
                <div className="d-flex flex-column gap-1" style={{ maxHeight: 300, overflowY: 'auto' }}>
                  <div className="form-check">
                    <input className="form-check-input" type="radio" name="category" checked={filters.search === ''} onChange={() => handleFilterChange('search', '')} />
                    <label className="form-check-label small">All Categories</label>
                  </div>
                  {categories.map(c => (
                    <div key={c.category_id} className="form-check">
                      <input className="form-check-input" type="radio" name="category" checked={filters.search === c.category_name} onChange={() => handleFilterChange('search', c.category_name)} />
                      <label className="form-check-label small">{c.category_name}</label>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-sm w-100 mb-2" onClick={() => loadWorkers()}>
                <i className="bi bi-funnel me-1"></i>Apply Filters
              </button>
              <button className="btn btn-outline-secondary btn-sm w-100" onClick={clearFilters}>
                Reset All
              </button>
            </div>
          </div>

          {/* ── Workers Grid ── */}
          <div className="col-md-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <p className="text-muted mb-0">
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2 text-primary"></span>Searching...</>
                ) : (
                  <><strong>{workers.length}</strong> workers found</>
                )}
              </p>
              {user?.role === 'hotel_owner' && (
                <small className="text-muted"><i className="bi bi-info-circle me-1"></i>Click "Book" to hire a worker</small>
              )}
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: 48, height: 48 }}></div>
                <p className="mt-3 text-muted">Loading workers...</p>
              </div>
            ) : workers.length === 0 ? (
              <div className="card text-center py-5">
                <i className="bi bi-person-x fs-1 text-muted d-block mb-3 opacity-50"></i>
                <h5>No workers found</h5>
                <p className="text-muted">Try adjusting your search filters or clearing them</p>
                <button className="btn btn-outline-primary mt-2" onClick={clearFilters}>
                  <i className="bi bi-x-circle me-1"></i>Clear Filters
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {workers.map(w => (
                  <div key={w.worker_id} className="col-md-6 col-lg-4">
                    <div className="card worker-card h-100">
                      <div className="card-body d-flex flex-column p-4">
                        {/* Avatar */}
                        <div className="text-center mb-3">
                          {w.profile_image ? (
                            <img
                              src={`http://localhost:5000${w.profile_image}`}
                              alt={w.full_name}
                              className="avatar"
                            />
                          ) : (
                            <div className="avatar-placeholder mx-auto">{w.full_name?.charAt(0)}</div>
                          )}
                        </div>

                        {/* Name & Location */}
                        <h6 className="fw-bold text-center mb-1">{w.full_name}</h6>
                        <p className="text-muted text-center small mb-2">
                          <i className="bi bi-geo-alt me-1"></i>{w.city || 'Location not set'}
                        </p>

                        {/* Rating */}
                        <div className="text-center mb-2">
                          {renderStars(w.rating)}
                          <span className="text-muted small ms-1">({w.total_reviews || 0})</span>
                        </div>

                        {/* Availability */}
                        <div className="text-center mb-3">
                          <span className={`badge rounded-pill px-3 py-1 ${w.availability === 'available' ? 'badge-available' : w.availability === 'busy' ? 'badge-busy' : 'badge-offline'}`}>
                            {w.availability === 'available' ? '🟢' : w.availability === 'busy' ? '🟡' : '⚫'} {w.availability}
                          </span>
                          {w.verification_status === 'verified' && (
                            <span className="badge bg-success ms-1" style={{ fontSize: '0.68rem' }}>
                              <i className="bi bi-shield-check me-1"></i>Verified
                            </span>
                          )}
                        </div>

                        {/* Skills */}
                        {w.skills && (
                          <div className="mb-3 text-center">
                            {w.skills.split(',').slice(0, 3).map(s => (
                              <span key={s} className="badge bg-light text-dark border me-1 mb-1" style={{ fontSize: '0.75rem' }}>
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Rate & Actions */}
                        <div className="mt-auto border-top pt-3 d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold text-primary">₹{w.hourly_rate}/hr</div>
                            <small className="text-muted">{w.experience_years}yr exp</small>
                          </div>
                          <div className="d-flex gap-1">
                            <Link to={`/workers/${w.worker_id}`} className="btn btn-outline-primary btn-sm">
                              <i className="bi bi-eye me-1"></i>View
                            </Link>
                            {user?.role === 'hotel_owner' && (
                              <Link to={`/book/${w.worker_id}`} className="btn btn-primary btn-sm">
                                <i className="bi bi-calendar-plus me-1"></i>Book
                              </Link>
                            )}
                            {!user && (
                              <Link to="/login" className="btn btn-primary btn-sm">
                                <i className="bi bi-lock me-1"></i>Book
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FindWorkersPage;
