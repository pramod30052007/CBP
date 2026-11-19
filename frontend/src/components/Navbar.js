import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationAPI } from '../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [registerMenuOpen, setRegisterMenuOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  const userDropdownRef = useRef(null);
  const registerDropdownRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setUserMenuOpen(false);
    setRegisterMenuOpen(false);
    setNavOpen(false);
  }, [location.pathname]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (registerDropdownRef.current && !registerDropdownRef.current.contains(e.target)) {
        setRegisterMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      notificationAPI.getAll()
        .then(res => setUnread(res.data.unread_count || res.data.unread || 0))
        .catch(() => {});
    }
  }, [user, location]);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'hotel_owner') return '/hotel/dashboard';
    return '/worker/dashboard';
  };

  const isActive = (path) => location.pathname === path ? 'active fw-semibold text-primary' : '';

  return (
    <nav
      className={`navbar navbar-expand-lg sticky-top bg-white ${scrolled ? 'shadow-sm' : ''}`}
      style={{ transition: 'all 0.3s', borderBottom: scrolled ? 'none' : '1px solid #f1f5f9', zIndex: 1030 }}
    >
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div className="rounded-2 bg-primary d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
            <i className="bi bi-buildings-fill text-white"></i>
          </div>
          <span className="fw-bold text-dark fs-5">Worker<span className="text-warning">Book</span></span>
        </Link>

        {/* Hamburger Toggler */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          onClick={() => setNavOpen(!navOpen)}
          aria-expanded={navOpen}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${navOpen ? 'show' : ''}`} id="navbarNav">
          {/* Left nav links */}
          <ul className="navbar-nav me-auto ms-lg-3 gap-1">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/find-workers')}`} to="/find-workers">Find Workers</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/about')}`} to="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/contact')}`} to="/contact">Contact</Link>
            </li>
          </ul>

          {/* Right nav */}
          <ul className="navbar-nav align-items-center gap-2 mt-3 mt-lg-0">
            {user ? (
              <>
                {/* Notification Bell */}
                <li className="nav-item">
                  <button
                    className="btn btn-sm btn-light border position-relative"
                    onClick={() => navigate(getDashboardLink())}
                    title="Notifications"
                    type="button"
                  >
                    <i className="bi bi-bell text-primary"></i>
                    {unread > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: '0.6rem' }}
                      >
                        {unread > 9 ? '9+' : unread}
                      </span>
                    )}
                  </button>
                </li>

                {/* User Dropdown */}
                <li className="nav-item dropdown position-relative" ref={userDropdownRef}>
                  <button
                    className="btn btn-link nav-link dropdown-toggle d-flex align-items-center gap-2 py-1 text-decoration-none border-0"
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-expanded={userMenuOpen}
                  >
                    <div
                      className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                      style={{ width: 34, height: 34, fontSize: 14, flexShrink: 0 }}
                    >
                      {user.full_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="d-none d-lg-block fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                      {user.full_name?.split(' ')[0]}
                    </span>
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end shadow border-0 ${userMenuOpen ? 'show' : ''}`} style={{ minWidth: 220, position: 'absolute', right: 0 }}>
                    <li className="px-3 py-2 border-bottom">
                      <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>{user.full_name}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>{user.email}</div>
                      <span className={`badge mt-1 ${user.role === 'admin' ? 'bg-danger' : user.role === 'hotel_owner' ? 'bg-warning text-dark' : 'bg-primary'}`}>
                        {user.role?.replace('_', ' ')}
                      </span>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2" to={getDashboardLink()} onClick={() => setUserMenuOpen(false)}>
                        <i className="bi bi-speedometer2 me-2 text-primary"></i>Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2" to="/bookings/history" onClick={() => setUserMenuOpen(false)}>
                        <i className="bi bi-clock-history me-2 text-primary"></i>Booking History
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2" to="/payments" onClick={() => setUserMenuOpen(false)}>
                        <i className="bi bi-credit-card me-2 text-primary"></i>Payments
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider my-1" /></li>
                    <li>
                      <button className="dropdown-item py-2 text-danger" onClick={() => { setUserMenuOpen(false); logout(); }} type="button">
                        <i className="bi bi-box-arrow-right me-2"></i>Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="btn btn-outline-primary btn-sm px-3" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i>Login
                  </Link>
                </li>
                <li className="nav-item dropdown position-relative" ref={registerDropdownRef}>
                  <button
                    className="btn btn-primary btn-sm px-3 dropdown-toggle"
                    type="button"
                    onClick={() => setRegisterMenuOpen(!registerMenuOpen)}
                    aria-expanded={registerMenuOpen}
                  >
                    <i className="bi bi-person-plus me-1"></i>Register
                  </button>
                  <ul className={`dropdown-menu dropdown-menu-end shadow border-0 ${registerMenuOpen ? 'show' : ''}`} style={{ position: 'absolute', right: 0 }}>
                    <li>
                      <Link className="dropdown-item py-2" to="/register/worker" onClick={() => setRegisterMenuOpen(false)}>
                        <i className="bi bi-person-badge me-2 text-primary"></i>As Worker
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2" to="/register/hotel" onClick={() => setRegisterMenuOpen(false)}>
                        <i className="bi bi-building me-2 text-warning"></i>As Hotel Owner
                      </Link>
                    </li>
                  </ul>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
