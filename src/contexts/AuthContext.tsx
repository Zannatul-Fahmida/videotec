import React, { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface User {
  email: string
  full_name: string
  access_token: string
  date_of_birth: string | null
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
  isInitializing: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Check for existing session on app initialization
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check for stored token in sessionStorage (persists during refresh, cleared on tab close)
        const storedToken = sessionStorage.getItem('access_token')
        const storedUser = sessionStorage.getItem('user_data')
        
        if (storedToken && storedUser) {
          // Validate the token with the backend
          const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const userData = await response.json()
            setUser({
              email: userData.email || JSON.parse(storedUser).email,
              full_name: userData.full_name || JSON.parse(storedUser).full_name,
              date_of_birth: userData.date_of_birth || JSON.parse(storedUser).date_of_birth,
              access_token: storedToken
            })
          } else {
            // Token is invalid, clear storage
            sessionStorage.removeItem('access_token')
            sessionStorage.removeItem('user_data')
          }
        }
      } catch (error) {
        console.log('No existing session found')
        // Clear invalid session data
        sessionStorage.removeItem('access_token')
        sessionStorage.removeItem('user_data')
      } finally {
        setIsInitializing(false)
      }
    }

    checkSession()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true)
    try {
      const formData = new URLSearchParams()
      formData.append('grant_type', 'password')
      formData.append('username', email)
      formData.append('password', password)

      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail?.[0]?.msg || 'Login failed')
      }

      // Fetch complete user profile data after successful authentication
      const profileResponse = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      let userData
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        userData = {
          email: profileData.email || email,
          full_name: profileData.full_name || email.split('@')[0],
          date_of_birth: profileData.date_of_birth || null,
          access_token: data.access_token
        }
      } else {
        // Fallback to basic user data if profile fetch fails
        userData = {
          email: email,
          full_name: email.split('@')[0],
          date_of_birth: null,
          access_token: data.access_token
        }
      }
      
      // Store token and user data in sessionStorage for persistence
      sessionStorage.setItem('access_token', data.access_token)
      sessionStorage.setItem('user_data', JSON.stringify(userData))
      
      setUser(userData)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    if (!user?.access_token) {
      setUser(null)
      return
    }

    setIsLoading(true)
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        }
      })
    } catch (error) {
      // Even if logout API fails, we should clear the user state
      console.error('Logout API failed:', error)
    } finally {
      // Clear stored session data
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('user_data')
      setUser(null)
      setIsLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isInitializing
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}