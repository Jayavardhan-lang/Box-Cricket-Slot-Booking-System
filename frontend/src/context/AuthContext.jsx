/**
 * AdminAuthContext — JWT-based single admin authentication.
 *
 * Replaces the previous hardcoded credential approach with:
 * - POST /api/auth/login  → validates credentials, returns JWT
 * - GET  /api/auth/verify → checks if stored token is still valid on app load
 * - POST /api/auth/logout → clears session server-side (JWT stateless)
 *
 * Token is stored in localStorage as 'eagle_admin_token'.
 * No credentials are stored or embedded in frontend code.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { API_URL } from '../config'

const AuthContext = createContext(null)

const TOKEN_KEY = 'eagle_admin_token'
const USERNAME_KEY = 'eagle_admin_username'

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminUsername, setAdminUsername] = useState('')
  /**
   * 'idle'     — initial state before token check
   * 'checking' — verifying persisted token on app load
   * 'ready'    — verification complete (logged in or not)
   */
  const [authStatus, setAuthStatus] = useState('idle')

  // ── On mount: validate any persisted token ──────────────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY)
    if (!savedToken) {
      setAuthStatus('ready')
      return
    }

    setAuthStatus('checking')
    axios.get(`${API_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then((res) => {
        if (res.data.success) {
          setIsLoggedIn(true)
          setAdminUsername(res.data.username || localStorage.getItem(USERNAME_KEY) || '')
        } else {
          _clearSession()
        }
      })
      .catch(() => {
        // Token expired or invalid — silently clear
        _clearSession()
      })
      .finally(() => {
        setAuthStatus('ready')
      })
  }, [])

  // ── Internal helpers ────────────────────────────────────────────────────────
  function _clearSession() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)
    setIsLoggedIn(false)
    setAdminUsername('')
  }

  function _saveSession(token, username) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USERNAME_KEY, username)
    setIsLoggedIn(true)
    setAdminUsername(username)
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  /**
   * Login — sends credentials to backend, stores JWT on success.
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  const login = useCallback(async (username, password) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { username, password })
      if (data.success && data.token) {
        _saveSession(data.token, data.username || username)
        return { success: true, message: 'Login successful' }
      }
      return { success: false, message: data.message || 'Invalid credentials' }
    } catch (err) {
      const status = err.response?.status
      if (status === 429) {
        return {
          success: false,
          message: 'Too many login attempts. Please wait 15 minutes before trying again.',
        }
      }
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid credentials',
      }
    }
  }, [])

  /**
   * Logout — clears session locally and notifies backend.
   */
  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      // Fire-and-forget backend logout (best-effort)
      axios.post(`${API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    _clearSession()
  }, [])

  /**
   * Returns the stored JWT token (for attaching to admin API requests).
   */
  const getToken = useCallback(() => {
    return localStorage.getItem(TOKEN_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ isLoggedIn, adminUsername, authStatus, login, logout, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
