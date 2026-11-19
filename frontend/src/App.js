import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import WorkerRegisterPage from './pages/WorkerRegisterPage';
import HotelRegisterPage from './pages/HotelRegisterPage';
import WorkerDashboard from './pages/WorkerDashboard';
import HotelDashboard from './pages/HotelDashboard';
import AdminDashboard from './pages/AdminDashboard';
import FindWorkersPage from './pages/FindWorkersPage';
import WorkerProfilePage from './pages/WorkerProfilePage';
import BookingPage from './pages/BookingPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import PaymentPage from './pages/PaymentPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="d-flex justify-content-center align-items-center" style={{height:'100vh'}}><div className="spinner-border text-primary" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/worker" element={<WorkerRegisterPage />} />
          <Route path="/register/hotel" element={<HotelRegisterPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/find-workers" element={<FindWorkersPage />} />
          <Route path="/workers/:id" element={<WorkerProfilePage />} />

          {/* Protected Routes */}
          <Route path="/worker/dashboard" element={
            <ProtectedRoute roles={['worker']}><WorkerDashboard /></ProtectedRoute>
          } />
          <Route path="/hotel/dashboard" element={
            <ProtectedRoute roles={['hotel_owner']}><HotelDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/book/:workerId" element={
            <ProtectedRoute roles={['hotel_owner']}><BookingPage /></ProtectedRoute>
          } />
          <Route path="/bookings/history" element={
            <ProtectedRoute roles={['hotel_owner','worker']}><BookingHistoryPage /></ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute roles={['hotel_owner','worker','admin']}><PaymentPage /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
