import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  const contactInfo = [
    { icon: 'bi-envelope-fill',   title: 'Email Us',     value: 'support@workerbook.com',   sub: 'We reply within 24 hours' },
    { icon: 'bi-telephone-fill',  title: 'Call Us',      value: '+91 98765 43210',          sub: 'Mon–Sat, 9AM – 8PM IST' },
    { icon: 'bi-clock-fill',      title: 'Working Hours',value: 'Monday – Saturday',         sub: '9:00 AM to 8:00 PM' },
    { icon: 'bi-geo-alt-fill',    title: 'Office',       value: 'Bangalore, Karnataka',      sub: 'India – 560001' },
  ];

  return (
    <>
      <Navbar />

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1a56db,#1140a6)' }} className="text-white py-5 text-center">
        <div className="container">
          <h2 className="fw-bold mb-2">Contact Us</h2>
          <p className="lead opacity-85 mb-0">We're here to help — reach out any time</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="row g-5">

          {/* ── Contact Info ── */}
          <div className="col-md-4">
            <h4 className="fw-bold mb-4">Get in Touch</h4>
            <div className="d-flex flex-column gap-4">
              {contactInfo.map(c => (
                <div key={c.title} className="d-flex align-items-start gap-3">
                  <div
                    className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 48, height: 48 }}
                  >
                    <i className={`bi ${c.icon} text-primary`}></i>
                  </div>
                  <div>
                    <div className="fw-semibold">{c.title}</div>
                    <div style={{ fontSize: '0.9rem' }}>{c.value}</div>
                    <small className="text-muted">{c.sub}</small>
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="card mt-4 p-3 bg-primary bg-opacity-5 border-0">
              <div className="fw-bold mb-2 text-primary"><i className="bi bi-question-circle me-2"></i>Quick FAQ</div>
              {[
                ['How do I book a worker?', 'Register as hotel owner, search workers, and click Book.'],
                ['How long does verification take?', 'Worker profiles are reviewed within 24–48 hours.'],
                ['What payment methods are accepted?', 'Cash, Online Transfer, Card, and UPI.'],
              ].map(([q, a]) => (
                <div key={q} className="mb-2">
                  <div className="fw-semibold small">{q}</div>
                  <div className="text-muted" style={{ fontSize: '0.82rem' }}>{a}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Contact Form ── */}
          <div className="col-md-8">
            <div className="card p-4 shadow-sm">
              <h4 className="fw-bold mb-1">Send a Message</h4>
              <p className="text-muted mb-4">Fill out the form below and we'll get back to you within 24 hours.</p>

              {sent && (
                <div className="alert alert-success d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill flex-shrink-0"></i>
                  <div>
                    <strong>Message sent!</strong> We'll get back to you within 24 hours.
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Your Name</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-person text-muted"></i></span>
                      <input className="form-control" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="bi bi-envelope text-muted"></i></span>
                      <input type="email" className="form-control" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Subject</label>
                    <input className="form-control" placeholder="How can we help you?" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Message</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      placeholder="Describe your query in detail..."
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="d-flex gap-3 mt-4">
                  <button type="submit" className="btn btn-primary px-5 py-2 fw-semibold" disabled={loading}>
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</>
                    ) : (
                      <><i className="bi bi-send me-2"></i>Send Message</>
                    )}
                  </button>
                  {sent && (
                    <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setSent(false)}>
                      Send Another
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ContactPage;
