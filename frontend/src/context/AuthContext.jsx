import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// Hardcoded admin credentials
const ADMIN_USERNAME = 'eagleadmin'
const ADMIN_PASSWORD = 'eagle@123'

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('eagle_admin_logged_in') === 'true'
  })

  /**
   * Login function - validates hardcoded credentials
   * @param {string} username
   * @param {string} password
   * @returns {{ success: boolean, message: string }}
   */
  const login = (username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem('eagle_admin_logged_in', 'true')
      setIsLoggedIn(true)
      return { success: true, message: 'Login successful' }
    }
    return { success: false, message: 'Invalid username or password' }
  }

  /**
   * Logout function - clears session
   */
  const logout = () => {
    localStorage.removeItem('eagle_admin_logged_in')
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
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
