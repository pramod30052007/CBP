import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AboutPage = () => (
  <>
    <Navbar />

    {/* Header */}
    <div style={{ background: 'linear-gradient(135deg,#1a56db,#1140a6)' }} className="text-white py-5 text-center">
      <div className="container">
        <h2 className="fw-bold mb-2">About WorkerBook</h2>
        <p className="lead opacity-85 mb-0">Transforming hospitality staffing across India</p>
      </div>
    </div>

    <div className="container py-5">

      {/* Mission */}
      <div className="row g-5 align-items-center mb-5">
        <div className="col-md-6">
          <h3 className="fw-bold mb-3">Our <span className="text-primary">Mission</span></h3>
          <p className="text-muted mb-3">
            WorkerBook bridges the gap between hotels, restaurants, and catering businesses with skilled local workers. 
            We provide a fast, transparent, and reliable platform for temporary and part-time hospitality staffing.
          </p>
          <p className="text-muted">
            Founded to solve the daily staffing challenges faced by hotels and the income instability faced by workers, 
            our platform creates win-win outcomes for both sides of the hospitality industry.
          </p>
          <div className="d-flex gap-3 mt-4">
            <Link to="/register/hotel" className="btn btn-primary px-4">For Hotels</Link>
            <Link to="/register/worker" className="btn btn-outline-primary px-4">For Workers</Link>
          </div>
        </div>
        <div className="col-md-6">
          <div className="row g-3">
            {[
              { icon: 'bi-shield-check', title: 'Verified Workers', desc: 'ID & background checked professionals', color: '#1a56db' },
              { icon: 'bi-clock', title: 'Quick Booking', desc: 'Book workers in under 2 minutes', color: '#f97316' },
              { icon: 'bi-currency-rupee', title: 'Fair Pay', desc: 'Transparent, agreed-upon rates with no hidden fees', color: '#22c55e' },
              { icon: 'bi-headset', title: '24/7 Support', desc: 'Always here when you need assistance', color: '#8b5cf6' },
            ].map(item => (
              <div key={item.title} className="col-6">
                <div className="card p-3 h-100">
                  <i className={`bi ${item.icon} fs-4 mb-2`} style={{ color: item.color }}></i>
                  <div className="fw-semibold small">{item.title}</div>
                  <small className="text-muted">{item.desc}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="row g-4 text-center mb-5">
        {[
          ['5,000+', 'Registered Workers'],
          ['500+', 'Partner Hotels'],
          ['25,000+', 'Bookings Done'],
          ['50+', 'Cities Covered'],
        ].map(([value, label]) => (
          <div key={label} className="col-6 col-md-3">
            <div className="card p-4">
              <div className="fw-bold text-primary display-6">{value}</div>
              <div className="text-muted small">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <h3 className="fw-bold text-center mb-4">How <span className="text-primary">WorkerBook</span> Works</h3>
      <div className="row g-4 mb-5">
        {[
          { step: 1, icon: 'bi-person-plus-fill', title: 'Register', desc: 'Create your account as a hotel owner or as a worker. Verification happens within 24 hours.', color: '#1a56db' },
          { step: 2, icon: 'bi-search', title: 'Search & Match', desc: 'Hotels browse verified workers by skill, location and rate. Workers receive instant booking notifications.', color: '#f97316' },
          { step: 3, icon: 'bi-calendar-check-fill', title: 'Book & Work', desc: 'Confirm the booking, the worker shows up, completes the job, and payment is processed automatically.', color: '#22c55e' },
        ].map(s => (
          <div key={s.step} className="col-md-4">
            <div className="card p-4 h-100 text-center">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-3"
                style={{ width: 60, height: 60, background: `${s.color}18` }}
              >
                <i className={`${s.icon} fs-4`} style={{ color: s.color }}></i>
              </div>
              <div className="badge mb-3" style={{ background: s.color, fontSize: '0.75rem' }}>Step {s.step}</div>
              <h5 className="fw-bold">{s.title}</h5>
              <p className="text-muted small mb-0">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Values */}
      <h3 className="fw-bold text-center mb-4">Our <span className="text-primary">Values</span></h3>
      <div className="row g-4">
        {[
          { icon: 'bi-eye', label: 'Transparency', text: 'Clear rates, no hidden fees, honest reviews from real hotel partners.' },
          { icon: 'bi-people', label: 'Community', text: 'Supporting local workers with steady income and local businesses with reliable staff.' },
          { icon: 'bi-award', label: 'Quality', text: 'Only verified, experienced professionals represent the WorkerBook standard.' },
        ].map(v => (
          <div key={v.label} className="col-md-4">
            <div className="card p-4 text-center h-100">
              <i className={`bi ${v.icon} text-primary fs-2 mb-3`}></i>
              <h5 className="fw-bold">{v.label}</h5>
              <p className="text-muted small mb-0">{v.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <Footer />
  </>
);

export default AboutPage;
