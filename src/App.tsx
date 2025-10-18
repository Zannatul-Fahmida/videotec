import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Loading from './components/Shared/Loading'
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
        <Route path="/course-details/:courseId" element={<CourseDetails />} />
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
