import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Loading from './components/Shared/Loading'
import ProtectedRoute from './components/Shared/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import MySchools from './pages/MySchools'
import CreateSchool from './pages/CreateSchool'
import MyClasses from './pages/MyClasses'
import CreateClass from './pages/CreateClass'
import MyCourses from './pages/MyCourses'
import CreateCourses from './pages/CreateCourses'
import CourseDetails from './pages/CourseDetails'
import './App.css'

function AppContent() {
  const { isInitializing } = useAuth()

  if (isInitializing) {
    return <Loading message="Loading..." fullPage />
  }

  return (
    <>
      <Routes>
        {/* Public routes - accessible by any user */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected routes - only accessible by authenticated users */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/create-school" element={<ProtectedRoute><CreateSchool /></ProtectedRoute>} />
        <Route path="/create-class" element={<ProtectedRoute><CreateClass /></ProtectedRoute>} />
        <Route path="/my-schools" element={<ProtectedRoute><MySchools /></ProtectedRoute>} />
        <Route path="/my-classes" element={<ProtectedRoute><MyClasses /></ProtectedRoute>} />
        <Route path="/create-courses" element={<ProtectedRoute><CreateCourses /></ProtectedRoute>} />
        <Route path="/my-courses" element={<ProtectedRoute><MyCourses /></ProtectedRoute>} />
        <Route path="/course-details/:courseId" element={<ProtectedRoute><CourseDetails /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
