import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Loading from '../components/Shared/Loading'
import Modal from '../components/Shared/Modal'
import CreateSchool from '../components/schools/CreateSchool'
import Header from '../components/Shared/Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface School {
  school_id: string
  name: string
  address: string
  image_url: string
  created_at: string
  roles: string[]
}

const Schools = () => {
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
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

  const handleSchoolCreated = () => {
    setIsCreateModalOpen(false)
    // Refresh the schools list
    if (user) {
      const fetchMySchools = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/schools/my-schools`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${user?.access_token}`,
              'Content-Type': 'application/json'
            }
          })
          const data = await response.json()
          if (response.ok) {
            setSchools(data)
          }
        } catch (err) {
          console.error('Failed to refresh schools:', err)
        }
      }
      fetchMySchools()
    }
  }

  if (loading) {
    return <Loading message="Loading schools..." fullPage />
  }

  return (
    <div className="min-h-screen bg-[#2E2E69] px-4 py-8">
      <Header />
      <div className="flex-1 flex justify-center items-start pt-8">
        <div className="w-full max-w-[375px]">
          {/* Header with Search and Plus Button */}
          <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-[#C0BFC4]">Dan56t</h1>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Add new school"
                >
                  <svg className="w-5 h-5 text-[#2E2E69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-[#C0BFC4]">Listes Des Ecoles</h2>
                <div className="flex items-center justify-end">
                  <button className="text-white rounded-full w-10 h-10 flex items-center justify-center hover:text-gray-100 transition-colors duration-200 cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
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
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#BA40A466] text-white py-2 px-6 rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 font-medium"
            >
              Create School
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {schools.map((school) => (
              <div 
                key={school.school_id} 
                className="bg-[#3F4851] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 relative cursor-pointer"
                onClick={() => navigate(`/classes/${school.school_id}`)}
              >
                {/* Settings Icon - Top Right */}
                <button
                  className="absolute top-3 right-3 w-8 h-8 text-white rounded-full flex items-center justify-center hover:text-gray-100 transition-colors duration-200 z-10 cursor-pointer"
                  aria-label="Settings"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle settings click here
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                <div className="p-4 flex items-start space-x-4">
                  {/* School Logo/Image */}
                  <div className="w-20 h-20 rounded-lg flex items-center justify-center">
                    {school.image_url ? (
                      <img
                        src={school.image_url}
                        alt={school.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                              <span class="text-white font-bold text-lg">${school.name.charAt(0).toUpperCase()}</span>
                            </div>
                          `
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {school.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* School Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#C0BFC4] font-semibold text-lg truncate mb-1">{school.name}</h3>
                    <p className="text-gray-300 text-sm uppercase truncate mb-3">Adresse: {school.address}</p>
                    
                    {/* Action Icons Below Title and Address */}
                    <div className="flex items-center space-x-3">
                      <button
                        className="w-4 h-4 text-white rounded-full flex items-center justify-center hover:text-gray-100 transition-colors duration-200 cursor-pointer"
                        aria-label="View details"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle view details click here
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-graduation-cap-icon lucide-graduation-cap"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
                      </button>
                      <button
                        className="w-4 h-4 text-white rounded-full flex items-center justify-center hover:text-gray-100 transition-colors duration-200 cursor-pointer"
                        aria-label="More options"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle more options click here
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-briefcase-icon lucide-briefcase"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      {/* Create School Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New School"
        maxWidth="max-w-md"
      >
        <CreateSchool onSchoolCreated={handleSchoolCreated} />
      </Modal>
    </div>
  )
}

export default Schools