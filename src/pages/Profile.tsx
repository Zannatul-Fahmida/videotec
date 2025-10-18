import { useState, useRef } from 'react'
import Header from '../components/Shared/Header'
import Loading from '../components/Shared/Loading'
import Spinner from '../components/Shared/Spinner'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, logout, isLoading, isInitializing } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Show loading while initializing or if user data is being loaded
  if (isInitializing || isLoading) {
    return <Loading message="Loading profile..." fullPage />
  }

  // If user is not logged in, redirect to login
  if (!user) {
    navigate('/login')
    return null
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
        toast.success('Profile image updated!')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
      toast.success('Logged out successfully!')
      navigate('/login')
    } catch (error) {
      toast.error('Logout failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Mock date of birth since it's not in the user data
  const mockDateOfBirth = "Not provided"
  const mockPoints = 63089
  const formatPoints = (n: number) => new Intl.NumberFormat().format(n)

  return (
    <div className="min-h-screen bg-[#2E2E69] py-8 px-4">
      <Header />

      {/* Main content per design */}
      <div className="md:max-w-[375px] mx-auto">
        {/* Avatar */}
        <div className="flex flex-col items-center mt-6">
          <div className="relative cursor-pointer" onClick={handleImageClick}>
            <div className="size-[130px] rounded-full bg-[#1EC9C7] overflow-hidden shadow-lg flex items-center justify-center">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-2xl font-bold">{getInitials(user.full_name)}</span>
              )}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

          {/* Name */}
          <h3 className="mt-4 text-white text-[24px] font-bold capitalize">{user.full_name}</h3>
          {/* Points pill */}
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-linear-to-r from-[#1E88E5] to-[#005CB9] text-white shadow">
            <svg className="w-4 h-4 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3l6 6-6 12-6-12 6-6z" />
            </svg>
            <span className="text-sm font-semibold tracking-wide">{formatPoints(mockPoints)}</span>
          </div>
        </div>

        {/* Details card */}
        <div className="flex flex-col gap-2 mt-4">
          {/* Full Name row */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#2E2E69] rounded-[14px] shadow-[0_6px_12px_rgba(6,20,40,0.22)]">
            <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              <span className="text-sm text-gray-300">Full Name</span>
            </div>
            <span className="text-sm text-gray-300">{user.full_name}</span>
          </div>
          {/* Email row */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#2E2E69] rounded-[14px] shadow-[0_6px_12px_rgba(6,20,40,0.22)]">
            <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              <span className="text-sm text-gray-300">Email</span>
            </div>
            <span className="text-sm text-gray-300">{user.email}</span>
          </div>
          {/* DOB row */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#2E2E69] rounded-[14px] shadow-[0_6px_12px_rgba(6,20,40,0.22)]">
            <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              <span className="text-sm text-gray-300">Date of birth</span>
            </div>
            <span className="text-sm text-gray-300">{user.date_of_birth ? user.date_of_birth : mockDateOfBirth}</span>
          </div>
        </div>

        {/* Director Role */}
        <div className="mt-6 flex justify-end">
          <button type="button" className="px-5 py-2 rounded-full bg-[#BA40A466] text-white text-sm font-medium shadow hover:brightness-110">Director Role</button>
        </div>

        {/* Logout button bottom */}
        <div className="mt-10">
          <button
            onClick={handleLogout}
            disabled={loading}
            className="w-full h-11 rounded-full bg-gradient-to-b from-[#E53935] to-[#B82421] text-[#2E2E69] font-medium shadow-lg hover:opacity-95 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Spinner size="sm" className="mr-2" />
                Logging out...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Log Out
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile