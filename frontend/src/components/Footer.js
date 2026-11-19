import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{ background: '#1e293b', color: '#94a3b8' }} className="py-5 mt-5">
    <div className="container">
      <div className="row g-4">
        {/* Brand */}
        <div className="col-lg-4">
          <div className="d-flex align-items-center gap-2 mb-3">
            <div className="rounded-2 bg-primary d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
              <i className="bi bi-buildings-fill text-white"></i>
            </div>
            <span className="fw-bold text-white fs-5">Worker<span className="text-warning">Book</span></span>
          </div>
          <p className="mb-4" style={{ fontSize: '0.9rem' }}>
            Connecting hotels, restaurants and catering businesses with skilled local workers for temporary and part-time staffing needs.
          </p>
          <div className="d-flex gap-3">
            {['facebook', 'twitter', 'instagram', 'linkedin'].map(s => (
              <a key={s} href="#" className="text-secondary fs-5" style={{ transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#fff'}
                onMouseLeave={e => e.target.style.color = ''}>
                <i className={`bi bi-${s}`}></i>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="col-lg-2 col-6">
          <h6 className="text-white fw-bold mb-3">Quick Links</h6>
          <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
            {[['/', 'Home'], ['/about', 'About Us'], ['/find-workers', 'Find Workers'], ['/contact', 'Contact']].map(([path, label]) => (
              <li key={path} className="mb-2">
                <Link to={path} className="text-secondary text-decoration-none"
                  style={{ transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = ''}>
                  <i className="bi bi-chevron-right me-1" style={{ fontSize: '0.7rem' }}></i>{label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Job Categories */}
        <div className="col-lg-3 col-6">
          <h6 className="text-white fw-bold mb-3">Job Categories</h6>
          <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
            {['Waiter / Waitress', 'Chef / Cook', 'Housekeeping Staff', 'Security Guard', 'Bartender', 'Event Staff'].map(c => (
              <li key={c} className="mb-2">
                <Link to="/find-workers" className="text-secondary text-decoration-none"
                  style={{ transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#fff'}
                  onMouseLeave={e => e.target.style.color = ''}>
                  <i className="bi bi-chevron-right me-1" style={{ fontSize: '0.7rem' }}></i>{c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="col-lg-3">
          <h6 className="text-white fw-bold mb-3">Contact Info</h6>
          <ul className="list-unstyled" style={{ fontSize: '0.9rem' }}>
            <li className="mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-envelope text-warning"></i>
              <span>support@workerbook.com</span>
            </li>
            <li className="mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-telephone text-warning"></i>
              <span>+91 98765 43210</span>
            </li>
            <li className="mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-clock text-warning"></i>
              <span>Mon–Sat, 9AM – 8PM</span>
            </li>
            <li className="mb-2 d-flex align-items-center gap-2">
              <i className="bi bi-geo-alt text-warning"></i>
              <span>Bangalore, Karnataka, India</span>
            </li>
          </ul>
        </div>
      </div>

      <hr style={{ borderColor: '#334155' }} className="mt-4" />

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2" style={{ fontSize: '0.85rem' }}>
        <p className="mb-0">© 2024 WorkerBook. All rights reserved.</p>
        <p className="mb-0">
          Made with <i className="bi bi-heart-fill text-danger"></i> for the hospitality industry
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
