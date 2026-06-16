import { createContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { authService } from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!token && !!user

  // Set axios default auth header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }, [token])

  // Fetch current user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await authService.getMe()
          setUser(response.data.user || response.data)
        } catch {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, []) // eslint-disable-line

  const login = useCallback(async (email, password) => {
    const response = await authService.login({ email, password })
    const { token: newToken, user: userData } = response.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    return response.data
  }, [])

  const register = useCallback(async (userData) => {
    const response = await authService.register(userData)
    const { token: newToken, user: newUser } = response.data
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(newUser)
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    return response.data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
    try { authService.logout() } catch { /* ignore */ }
  }, [])

  const updateProfile = useCallback(async (profileData) => {
    const response = await authService.updateProfile(profileData)
    setUser(response.data.user || response.data)
    return response.data
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
