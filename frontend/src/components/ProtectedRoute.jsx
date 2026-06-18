import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

function ProtectedRoute({ children }) {
  const { isLoggedIn, authStatus } = useAuth()

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

  if (!isLoggedIn) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedRoute
