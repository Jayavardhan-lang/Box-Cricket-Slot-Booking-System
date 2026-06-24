import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { useCustomerAuth } from './context/CustomerAuthContext'

import Home from './pages/Home'
import BookSlot from './pages/BookSlot'
import MyBookings from './pages/MyBookings'
import Tournaments from './pages/Tournaments'
import Membership from './pages/Membership'
import FAQ from './pages/FAQ'

import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import SlotManagement from './pages/admin/SlotManagement'
import AdminBookings from './pages/admin/Bookings'
import BookingDetail from './pages/admin/BookingDetail'
import TournamentManagement from './pages/admin/TournamentManagement'
import MembershipManagement from './pages/admin/MembershipManagement'
import Reports from './pages/admin/Reports'
import AdminFeedback from './pages/admin/Feedback'

function App() {
  const { customer } = useCustomerAuth()
  const isCustomerLoggedIn = !!customer

  return (
    <Routes>

      <Route path="/" element={<Home />} />

      {/* Protected customer routes — redirect to home with login modal if not logged in */}
      <Route
        path="/book-slot"
        element={
          isCustomerLoggedIn
            ? <BookSlot />
            : <Navigate to="/" state={{ showLogin: true }} replace />
        }
      />
      <Route
        path="/my-bookings"
        element={
          isCustomerLoggedIn
            ? <MyBookings />
            : <Navigate to="/" state={{ showLogin: true }} replace />
        }
      />

      <Route path="/tournaments" element={<Tournaments />} />
      <Route path="/membership" element={<Membership />} />
      <Route path="/faq" element={<FAQ />} />

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/slots"
        element={
          <ProtectedRoute>
            <SlotManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute>
            <AdminBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings/:id"
        element={
          <ProtectedRoute>
            <BookingDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tournaments"
        element={
          <ProtectedRoute>
            <TournamentManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/memberships"
        element={
          <ProtectedRoute>
            <MembershipManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/feedback"
        element={
          <ProtectedRoute>
            <AdminFeedback />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
