import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Shared/Header'
import Loading from '../components/Shared/Loading'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface School {
  school_id: string
  name: string
  address: string
  image_url: string
  created_at: string
  roles: string[]
}

const MySchools = () => {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { user, isLoading, isInitializing } = useAuth()
  const navigate = useNavigate()

  // Show loading while initializing or if user data is being loaded
  if (isInitializing || isLoading) {
    return <Loading fullPage />
  }

  useEffect(() => {
    const fetchMySchools = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/schools/my-schools`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user?.access_token}`,
            'Content-Type': 'application/json'
          }
        })

        const data = await response.json()
        
        if (!response.ok) {
          if (response.status === 422 && data.detail) {
            const errorMessages = data.detail.map((err: any) => err.msg).join(', ')
            throw new Error(errorMessages)
          }
          throw new Error(data.message || 'Failed to fetch schools')
        }
        
        setSchools(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch schools'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchMySchools()
    }
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'admin': 'bg-red-100 text-red-800',
      'teacher': 'bg-blue-100 text-blue-800',
      'student': 'bg-green-100 text-green-800',
      'staff': 'bg-yellow-100 text-yellow-800'
    }
    return colors[role.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const copySchoolId = async (schoolId: string) => {
    try {
      await navigator.clipboard.writeText(schoolId)
      setCopiedId(schoolId)
      toast.success('School ID copied to clipboard!')
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedId(null)
      }, 2000)
    } catch (err) {
      toast.error('Failed to copy school ID')
    }
  }

  if (loading) {
    return <Loading message="Loading schools..." fullPage />
  }

  return (
    <div className="min-h-screen bg-[#2E2E69] px-4 py-8">
      <Header />
      <div className="flex-1 flex justify-center items-start pt-8 px-4">
        <div className="w-full max-w-[375px]">
          {/* Header */}
          <div className="bg-[#2E2E69] rounded-lg shadow-xl overflow-hidden mb-8">
            <div className="p-6">
              <h1 className="text-3xl font-bold text-white text-center">My Schools</h1>
              <p className="text-white text-center mt-2 opacity-90">Schools where you have roles and access</p>
            </div>
          </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm mb-6">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {schools.length === 0 ? (
          <div className="bg-[#2E2E69] rounded-lg shadow-xl p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">No Schools Found</h3>
            <p className="text-gray-300 mb-6">You don't have access to any schools yet.</p>
            <button
              onClick={() => navigate('/create-school')}
              className="bg-[#BA40A466] text-white py-2 px-6 rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 font-medium"
            >
              Create School
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {schools.map((school) => (
              <div key={school.school_id} className="bg-[#2E2E69] rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                {/* School Image */}
                <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 relative overflow-hidden">
                  {school.image_url ? (
                    <img
                      src={school.image_url}
                      alt={school.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to gradient background if image fails to load
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <svg className="h-16 w-16 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* School Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white flex-1">{school.name}</h3>
                    <button
                      onClick={() => copySchoolId(school.school_id)}
                      className={`ml-3 flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                        copiedId === school.school_id
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:text-gray-800'
                      }`}
                      title={`Copy School ID: ${school.school_id}`}
                    >
                      {copiedId === school.school_id ? (
                        <>
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          ID
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-gray-300 mb-4 flex items-center">
                    <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {school.address}
                  </p>
                  
                  {/* Roles */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-300 mb-2">Your Roles:</p>
                    <div className="flex flex-wrap gap-2">
                      {school.roles.map((role, index) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(role)}`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Created Date */}
                  <p className="text-sm text-gray-400 mb-4">
                    Created: {formatDate(school.created_at)}
                  </p>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      // Navigate to school details or dashboard
                      toast.success(`Accessing ${school.name}`)
                    }}
                    className="w-full bg-[#BA40A4] text-white py-2 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 font-medium"
                  >
                    School Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default MySchools