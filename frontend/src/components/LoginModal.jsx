import { useEffect } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { useCustomerAuth } from '../context/CustomerAuthContext'
import { useState } from 'react'
import Spinner from './Spinner'

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { loginWithGoogle } = useCustomerAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleGoogleLogin = useGoogleLogin({
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
        onClose()
        if (onLoginSuccess) onLoginSuccess()
      } catch (err) {
        setError('Sign-in failed. Please try again.')
        console.error('Google login error:', err)
      } finally {
        setLoading(false)
      }
    },
    onError: () => {
      setError('Google sign-in was cancelled or failed.')
      setLoading(false)
    },
  })

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        animation: 'modalOverlayIn 0.3s ease forwards',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <style>{`
        @keyframes modalOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalCardIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        style={{
          background: '#111111',
          border: '1px solid rgba(0,200,83,0.3)',
          borderRadius: '24px',
          padding: '48px 40px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
          position: 'relative',
          animation: 'modalCardIn 0.3s ease forwards',
        }}
      >
        {/* Close button */}
        <button
          id="login-modal-close-btn"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: 'rgba(255,255,255,0.5)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px',
            lineHeight: 1,
            padding: '4px 8px',
            borderRadius: '8px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'white'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
          aria-label="Close login modal"
        >
          ✕
        </button>

        {/* Cricket emoji */}
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏏</div>

        {/* Heading */}
        <h2 style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '22px',
          fontWeight: 700,
          color: 'white',
          margin: '0 0 12px',
          lineHeight: 1.3,
        }}>
          Welcome to Eagle Box Cricket
        </h2>

        {/* Subtext */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.6)',
          margin: '0 0 32px',
          lineHeight: 1.6,
        }}>
          Login to book slots, register for tournaments and manage your bookings
        </p>

        {/* Google Login Button */}
        <button
          id="google-login-modal-btn"
          onClick={() => { setError(''); handleGoogleLogin() }}
          disabled={loading}
          style={{
            background: 'white',
            color: '#1a1a1a',
            border: 'none',
            borderRadius: '50px',
            padding: '14px 32px',
            width: '100%',
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            opacity: loading ? 0.7 : 1,
            marginBottom: '20px',
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.background = '#f5f5f5'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)'
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'white'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)'
          }}
        >
          {loading ? (
            <>
              <Spinner size="sm" color="#374151" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              {/* Google G Logo SVG */}
              <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', flexShrink: 0 }} xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* Error message */}
        {error && (
          <p style={{
            color: '#ff6b6b',
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif',
            marginBottom: '16px',
          }}>
            {error}
          </p>
        )}

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '0 0 16px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Guest note */}
        <p style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.6,
          margin: 0,
        }}>
          You need to login to book slots.<br />
          <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={onClose}>
            Browse the site as guest without login
          </span>
        </p>
      </div>
    </div>
  )
}
