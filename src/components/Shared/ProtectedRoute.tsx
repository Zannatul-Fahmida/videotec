import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Loading from './Loading'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isInitializing } = useAuth()

  // Show loading while checking authentication status
  if (isInitializing) {
    return <Loading message="Loading..." fullPage />
  }

  // If user is not authenticated, redirect to home page
  if (!user) {
    return <Navigate to="/" replace />
  }

  // If user is authenticated, render the protected component
  return <>{children}</>
}

export default ProtectedRoute