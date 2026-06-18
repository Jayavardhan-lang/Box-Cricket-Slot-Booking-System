import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

/**
 * ProtectedRoute — wraps admin pages that require JWT authentication.
 *
 * Behaviour:
 * - While the stored token is being verified on app load → show spinner
 * - Verified and logged in → render children normally
 * - Not logged in (or token expired/invalid) → redirect to /admin/login
 */
function ProtectedRoute({ children }) {
  const { isLoggedIn, authStatus } = useAuth()

  // Still verifying the persisted token — show a loading screen
  if (authStatus === 'idle' || authStatus === 'checking') {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="font-accent text-xs text-brand-greyMedium tracking-[2px] uppercase">
            Verifying session...
          </p>
        </div>
      </div>
    )
  }

  // Token verified, not authenticated → redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />
  }

  // Authenticated — render the protected page
  return children
}

export default ProtectedRoute
