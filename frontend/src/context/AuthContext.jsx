
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { API_URL } from '../config'

const AuthContext = createContext(null)

const TOKEN_KEY = 'eagle_admin_token'
const USERNAME_KEY = 'eagle_admin_username'

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [adminUsername, setAdminUsername] = useState('')

  const [authStatus, setAuthStatus] = useState('idle')

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

        _clearSession()
      })
      .finally(() => {
        setAuthStatus('ready')
      })
  }, [])

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

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {

      axios.post(`${API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})
    }
    _clearSession()
  }, [])

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
