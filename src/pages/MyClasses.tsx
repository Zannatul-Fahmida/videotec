import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface School {
  school_id: string
  name: string
  roles: string[]
}

interface Class {
  class_id: string
  name: string
  short_description: string
  level: string
  day_of_week: string
  start_time: string
  end_time: string
  school_id: string
  created_at: string
}

const MyClasses = () => {
  const [schools, setSchools] = useState<School[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedSchool, setSelectedSchool] = useState<string>('')
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [classesLoading, setClassesLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { user, isLoading, isInitializing } = useAuth()
  const navigate = useNavigate()

  // Show loading while initializing or if user data is being loaded
  if (isInitializing || isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-purple-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700 font-medium">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  // If user is not logged in, redirect to login
  if (!user) {
    navigate('/login')
    return null
  }

  // Fetch schools on component mount
  useEffect(() => {
    const fetchMySchools = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/schools/my-schools`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
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
        
        // Auto-select first school and first role if available
        if (data.length > 0 && data[0].roles.length > 0) {
          setSelectedSchool(data[0].school_id)
          setSelectedRole(data[0].roles[0])
        }
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

  // Fetch classes when school or role changes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!selectedSchool || !selectedRole) return

      try {
        setClassesLoading(true)
        setError('')

        console.log('Fetching classes for:', { selectedSchool, selectedRole })
        console.log('API URL:', `${API_BASE_URL}/classes/by-role/${selectedSchool}/${selectedRole}`)
        
        const response = await fetch(`${API_BASE_URL}/classes/by-role/${selectedSchool}/${selectedRole}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user?.access_token}`,
            'Content-Type': 'application/json'
          }
        })

        console.log('Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.log('Error response:', errorText)
          
          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { message: errorText }
          }
          
          if (response.status === 422 && errorData.detail) {
            const errorMessages = errorData.detail.map((err: any) => err.msg).join(', ')
            throw new Error(errorMessages)
          }
          if (response.status === 500) {
            throw new Error(`Server error (500): ${errorData.message || errorData.detail || 'Internal server error'}`)
          }
          if (response.status === 404) {
            throw new Error(`Endpoint not found (404): The API endpoint may not exist or the parameters are incorrect`)
          }
          throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch classes`)
        }
        
        const data = await response.json()
        console.log('Response data:', data)
        
        setClasses(data)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch classes'
        console.error('Fetch classes error:', err)
        setError(errorMessage)
        toast.error(errorMessage)
        setClasses([])
      } finally {
        setClassesLoading(false)
      }
    }

    fetchClasses()
  }, [selectedSchool, selectedRole, user])

  const copyClassId = async (classId: string) => {
    try {
      await navigator.clipboard.writeText(classId)
      setCopiedId(classId)
      toast.success('Class ID copied to clipboard!')
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedId(null)
      }, 2000)
    } catch (err) {
      toast.error('Failed to copy class ID')
    }
  }

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDayColor = (day: string) => {
    const colors: { [key: string]: string } = {
      'monday': 'bg-blue-100 text-blue-800',
      'tuesday': 'bg-green-100 text-green-800',
      'wednesday': 'bg-yellow-100 text-yellow-800',
      'thursday': 'bg-purple-100 text-purple-800',
      'friday': 'bg-red-100 text-red-800',
      'saturday': 'bg-indigo-100 text-indigo-800',
      'sunday': 'bg-pink-100 text-pink-800'
    }
    return colors[day.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800'
    }
    return colors[level.toLowerCase()] || 'bg-gray-100 text-gray-800'
  }

  const getSelectedSchoolName = () => {
    const school = schools.find(s => s.school_id === selectedSchool)
    return school ? school.name : 'Select School'
  }

  const getAvailableRoles = () => {
    const school = schools.find(s => s.school_id === selectedSchool)
    return school ? school.roles : []
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-purple-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700 font-medium">Loading schools...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 p-6">
            <h1 className="text-3xl font-bold text-white text-center">My Classes</h1>
            <p className="text-white text-center mt-2 opacity-90">Classes based on your role in each school</p>
          </div>
        </div>

        {/* School and Role Selection */}
        {schools.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select School
                </label>
                <select
                  value={selectedSchool}
                  onChange={(e) => {
                    setSelectedSchool(e.target.value)
                    const school = schools.find(s => s.school_id === e.target.value)
                    if (school && school.roles.length > 0) {
                      setSelectedRole(school.roles[0])
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  {schools.map((school) => (
                    <option key={school.school_id} value={school.school_id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                  disabled={!selectedSchool}
                >
                  {getAvailableRoles().map((role) => (
                    <option key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {selectedSchool && selectedRole && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700">
                  <span className="font-medium">Viewing classes for:</span> {getSelectedSchoolName()} as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                </p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm mb-6">
            <div className="flex">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {schools.length === 0 ? (
          <div className="bg-white rounded-lg shadow-xl p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Schools Found</h3>
            <p className="text-gray-500 mb-6">You don't have access to any schools yet.</p>
            <button
              onClick={() => navigate('/create-school')}
              className="bg-[#BA40A4] text-white py-2 px-6 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 font-medium"
            >
              Create School
            </button>
          </div>
        ) : classesLoading ? (
          <div className="bg-white rounded-lg shadow-xl p-12 text-center">
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-purple-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-gray-700 font-medium">Loading classes...</span>
            </div>
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-xl p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Found</h3>
            <p className="text-gray-500 mb-6">No classes available for your current role in this school.</p>
            <button
              onClick={() => navigate('/create-class')}
              className="bg-[#BA40A4] text-white py-2 px-6 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 font-medium"
            >
              Create Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <div key={classItem.class_id} className="bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                {/* Class Header */}
                <div className="h-32 bg-gradient-to-br from-purple-400 to-purple-600 relative overflow-hidden">
                  <div className="flex items-center justify-center h-full">
                    <svg className="h-12 w-12 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>

                {/* Class Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 flex-1">{classItem.name}</h3>
                    <button
                      onClick={() => copyClassId(classItem.class_id)}
                      className={`ml-3 flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                        copiedId === classItem.class_id
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:text-gray-800'
                      }`}
                      title={`Copy Class ID: ${classItem.class_id}`}
                    >
                      {copiedId === classItem.class_id ? (
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

                  <p className="text-gray-600 mb-4">{classItem.short_description}</p>
                  
                  {/* Class Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Level:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(classItem.level)}`}>
                        {classItem.level}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Day:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDayColor(classItem.day_of_week)}`}>
                        {classItem.day_of_week}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Time:</span>
                      <span className="text-sm text-gray-600">
                        {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                      </span>
                    </div>
                  </div>

                  {/* Created Date */}
                  <p className="text-sm text-gray-500 mb-4">
                    Created: {formatDate(classItem.created_at)}
                  </p>

                  {/* Action Button */}
                  <button
                    onClick={() => {
                      toast.success(`Accessing ${classItem.name}`)
                    }}
                    className="w-full bg-[#BA40A4] text-white py-2 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 font-medium"
                  >
                    Access Class
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyClasses