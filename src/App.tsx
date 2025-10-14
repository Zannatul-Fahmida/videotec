import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/home/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Profile from './pages/Profile'
import CreateSchool from './pages/CreateSchool'
import CreateClass from './pages/CreateClass'
import MySchools from './pages/MySchools'
import MyClasses from './pages/MyClasses'
import CreateCourses from './pages/CreateCourses'
import MyCourses from './pages/MyCourses'

function AppContent() {
  const { isInitializing } = useAuth()

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BA40A4] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-school" element={<CreateSchool />} />
        <Route path="/create-class" element={<CreateClass />} />
        <Route path="/my-schools" element={<MySchools />} />
        <Route path="/my-classes" element={<MyClasses />} />
        <Route path="/create-courses" element={<CreateCourses />} />
        <Route path="/my-courses" element={<MyCourses />} />
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
