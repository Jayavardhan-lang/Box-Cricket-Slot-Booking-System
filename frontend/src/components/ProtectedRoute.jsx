import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute - wraps admin pages that require authentication
 * Redirects to /admin/login if not logged in
 */
function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedRoute
