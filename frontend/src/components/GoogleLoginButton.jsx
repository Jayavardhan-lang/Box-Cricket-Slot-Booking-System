import { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import Spinner from './Spinner'

/**
 * Reusable "Sign in with Google" button.
 * Fetches the user profile from Google's userinfo API on success
 * and stores it in CustomerAuthContext.
 *
 * @param {{ compact?: boolean }} props
 *   compact — if true, show icon-only version (for mobile / tight spaces)
 */
export default function GoogleLoginButton({ compact = false }) {
  const { loginWithGoogle } = useCustomerAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        })
        if (!res.ok) throw new Error('Failed to fetch profile')
        const profile = await res.json()
        loginWithGoogle({
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
        })
      } catch (err) {
        setError('Sign-in failed. Please try again.')
        console.error('Google login error:', err)
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled.')
      setLoading(false)
    },
  })

  if (compact) {
    return (
      <button
        id="google-login-btn-compact"
        onClick={() => { setError(''); login() }}
        disabled={loading}
        title="Sign in with Google"
        className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-300 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <Spinner size="sm" />
        ) : (
          /* Google "G" SVG icon */
          <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
      </button>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        id="google-login-btn"
        onClick={() => { setError(''); login() }}
        disabled={loading}
        className="flex items-center gap-2.5 px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 font-heading font-bold text-[12px] tracking-wide rounded-full border border-white/20 transition-all duration-300 hover:scale-105 shadow-[0_2px_12px_rgba(255,255,255,0.12)] disabled:opacity-60 cursor-pointer"
      >
        {loading ? (
          <>
            <Spinner size="sm" color="#374151" />
            <span className="text-gray-600">Signing in...</span>
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Sign in with Google</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-[10px] text-red-400 font-sans ml-1">{error}</p>
      )}
    </div>
  )
}
