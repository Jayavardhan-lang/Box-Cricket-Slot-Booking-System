import { createContext, useContext, useState, useCallback } from 'react'

const CustomerAuthContext = createContext(null)

const STORAGE_KEY = 'eagle_customer_profile'

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  /**
   * Called after successful Google OAuth flow.
   * Stores the Google user profile (name, email, picture) in state + localStorage.
   * @param {{ name: string, email: string, picture: string }} profile
   */
  const loginWithGoogle = useCallback((profile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    setCustomer(profile)
  }, [])

  /**
   * Clears the customer session from state + localStorage.
   */
  const logoutCustomer = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setCustomer(null)
  }, [])

  return (
    <CustomerAuthContext.Provider value={{ customer, loginWithGoogle, logoutCustomer }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext)
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider')
  }
  return context
}

export default CustomerAuthContext
