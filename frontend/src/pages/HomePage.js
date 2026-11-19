import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { categoryAPI } from '../utils/api';

const jobCategories = [
  { name: 'Waiter / Waitress', icon: 'bi-cup-straw', color: '#1a56db' },
  { name: 'Chef / Cook', icon: 'bi-fire', color: '#f97316' },
  { name: 'Housekeeping', icon: 'bi-house-heart', color: '#8b5cf6' },
  { name: 'Security Guard', icon: 'bi-shield-check', color: '#22c55e' },
  { name: 'Receptionist', icon: 'bi-telephone', color: '#f59e0b' },
  { name: 'Bartender', icon: 'bi-cup', color: '#ef4444' },
  { name: 'Event Staff', icon: 'bi-balloon', color: '#06b6d4' },
  { name: 'Maintenance', icon: 'bi-tools', color: '#64748b' },
];

const platformStats = [
  { label: 'Registered Workers', value: '5,000+', icon: 'bi-people-fill', color: 'blue' },
  { label: 'Hotels Partnered', value: '500+', icon: 'bi-building', color: 'orange' },
  { label: 'Bookings Completed', value: '25,000+', icon: 'bi-check-circle-fill', color: 'green' },
  { label: 'Cities Covered', value: '50+', icon: 'bi-geo-alt-fill', color: 'purple' },
];

const testimonials = [
  { name: 'Raj Sharma', role: 'Hotel Manager, Grand Palace', text: 'WorkerBook helped us find reliable staff for our events within hours. Absolutely game-changing for our operations!', stars: 5 },
  { name: 'Priya Patel', role: 'Restaurant Owner, Mumbai', text: 'The quality of workers on this platform is exceptional. Easy to book, reliable, and professional every time.', stars: 5 },
  { name: 'Amit Kumar', role: 'Waiter (Worker)', text: 'I get consistent work through WorkerBook. The platform is easy to use and payments are always on time.', stars: 5 },
];

const HomePage = () => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (searchCategory) params.set('category', searchCategory);
    navigate(`/find-workers?${params.toString()}`);
  };

  return (
    <>
      <Navbar />

      {/* ── Hero Section ── */}
      <section
        className="text-white position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1a56db 0%, #1140a6 50%, #0d2d7a 100%)',
          minHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Decorative pattern */}
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center g-5">
            {/* Left copy */}
            <div className="col-lg-7">
              <span className="badge bg-warning text-dark mb-3 px-3 py-2 rounded-pill fw-semibold">
                🏨 Hotel Staffing Made Simple
              </span>
              <h1 className="display-4 fw-bold mb-4 lh-sm">
                Find <span className="text-warning">Skilled Workers</span> for Your Hotel <em>Instantly</em>
              </h1>
              <p className="lead mb-5" style={{ opacity: 0.88 }}>
                Connect with verified local workers — waiters, chefs, housekeeping, security, and more.
                Book for 2–8 hours or custom shifts. Fast, reliable, and professional.
              </p>

              {/* Search Box */}
              <div className="bg-white rounded-3 p-3 shadow-lg mb-4">
                <form onSubmit={handleSearch}>
                  <div className="row g-2">
                    <div className="col-md-5">
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        placeholder="🏙️ Enter city..."
                        value={searchCity}
                        onChange={e => setSearchCity(e.target.value)}
                      />
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-select border-0 bg-light"
                        value={searchCategory}
                        onChange={e => setSearchCategory(e.target.value)}
                      >
                        <option value="">All Job Roles</option>
                        {jobCategories.map(c => (
                          <option key={c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3">
                      <button type="submit" className="btn btn-primary w-100 fw-semibold">
                        <i className="bi bi-search me-1"></i> Search
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* CTA Buttons */}
              <div className="d-flex gap-3 flex-wrap">
                <Link to="/register/hotel" className="btn btn-warning btn-lg fw-semibold px-4">
                  <i className="bi bi-building me-2"></i>I'm a Hotel Owner
                </Link>
                <Link to="/register/worker" className="btn btn-outline-light btn-lg fw-semibold px-4">
                  <i className="bi bi-person-badge me-2"></i>I'm a Worker
                </Link>
              </div>
            </div>

            {/* Right feature cards */}
            <div className="col-lg-5 d-none d-lg-block">
              <div className="row g-3">
                {[
                  { icon: 'bi-person-check-fill', label: 'Verified Workers', desc: 'ID & background checked' },
                  { icon: 'bi-clock-fill', label: 'Flexible Hours', desc: '2h, 4h, 6h, 8h or custom' },
                  { icon: 'bi-shield-lock-fill', label: 'Secure Booking', desc: 'JWT protected platform' },
                  { icon: 'bi-star-fill', label: 'Rated Staff', desc: 'Real reviews & ratings' },
                ].map((item, i) => (
                  <div key={i} className="col-6">
                    <div
                      className="card text-dark text-center p-3 h-100"
                      style={{ animationDelay: `${i * 0.1}s`, border: 'none', borderRadius: 12 }}
                    >
                      <i className={`${item.icon} text-primary fs-2 mb-2`}></i>
                      <div className="fw-bold small">{item.label}</div>
                      <div className="text-muted" style={{ fontSize: '0.78rem' }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row g-4">
            {platformStats.map((stat, i) => (
              <div key={i} className="col-6 col-md-3">
                <div className={`stat-card ${stat.color} text-center`}>
                  <i className={`${stat.icon} d-block mb-2`} style={{ fontSize: '2rem', opacity: 0.75 }}></i>
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Job Categories ── */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Job <span className="text-primary">Categories</span></h2>
            <p className="text-muted">Find workers across all hotel and hospitality roles</p>
          </div>
          <div className="row g-4">
            {jobCategories.map((cat, i) => (
              <div key={i} className="col-6 col-md-3">
                <Link to={`/find-workers?category=${encodeURIComponent(cat.name)}`} className="text-decoration-none">
                  <div className="card text-center p-4 h-100" style={{ transition: 'all 0.3s', cursor: 'pointer' }}>
                    <div
                      className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                      style={{ width: 60, height: 60, background: `${cat.color}18` }}
                    >
                      <i className={`${cat.icon} fs-4`} style={{ color: cat.color }}></i>
                    </div>
                    <h6 className="fw-semibold text-dark mb-0">{cat.name}</h6>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <Link to="/find-workers" className="btn btn-outline-primary px-5">
              View All Workers <i className="bi bi-arrow-right ms-1"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">How It <span className="text-primary">Works</span></h2>
            <p className="text-muted">Get started in just 3 simple steps</p>
          </div>
          <div className="row g-4">
            {[
              {
                step: '01',
                icon: 'bi-person-plus-fill',
                title: 'Register & Create Profile',
                desc: 'Sign up as a hotel owner or worker. Create your professional profile with skills, photos, and availability.',
                color: '#1a56db',
              },
              {
                step: '02',
                icon: 'bi-search',
                title: 'Search & Filter Workers',
                desc: 'Hotels search for workers by skill, city, experience, and hourly rate. Find the perfect match instantly.',
                color: '#f97316',
              },
              {
                step: '03',
                icon: 'bi-calendar-check-fill',
                title: 'Book & Get to Work',
                desc: 'Send booking requests, workers accept or reject in real time, payment is calculated automatically.',
                color: '#22c55e',
              },
            ].map((step, i) => (
              <div key={i} className="col-md-4">
                <div className="card p-4 h-100 text-center border-0 shadow-sm">
                  <div className="fw-bold mb-3" style={{ fontSize: '3rem', color: step.color, opacity: 0.15 }}>
                    {step.step}
                  </div>
                  <div
                    className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                    style={{ width: 64, height: 64, background: `${step.color}18` }}
                  >
                    <i className={`${step.icon} fs-4`} style={{ color: step.color }}></i>
                  </div>
                  <h5 className="fw-bold">{step.title}</h5>
                  <p className="text-muted small mb-0">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold">What Our <span className="text-primary">Users Say</span></h2>
            <p className="text-muted">Trusted by hotels and workers across India</p>
          </div>
          <div className="row g-4">
            {testimonials.map((t, i) => (
              <div key={i} className="col-md-4">
                <div className="card p-4 h-100">
                  <div className="text-warning mb-3" style={{ fontSize: '1.1rem', letterSpacing: 2 }}>
                    {'★'.repeat(t.stars)}
                  </div>
                  <p className="text-muted fst-italic mb-4">"{t.text}"</p>
                  <div className="d-flex align-items-center gap-3 mt-auto">
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                      style={{ width: 44, height: 44 }}
                    >
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="fw-semibold">{t.name}</div>
                      <small className="text-muted">{t.role}</small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section
        className="py-5"
        style={{ background: 'linear-gradient(135deg, #1a56db, #f97316)' }}
      >
        <div className="container text-center text-white">
          <h2 className="fw-bold mb-3">Ready to Get Started?</h2>
          <p className="lead mb-4" style={{ opacity: 0.9 }}>
            Join thousands of hotels and workers on India's most trusted hospitality staffing platform
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to="/register/hotel" className="btn btn-warning btn-lg px-5 fw-semibold">
              <i className="bi bi-building me-2"></i>Post a Job
            </Link>
            <Link to="/register/worker" className="btn btn-outline-light btn-lg px-5 fw-semibold">
              <i className="bi bi-person-badge me-2"></i>Find Work
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default HomePage;
