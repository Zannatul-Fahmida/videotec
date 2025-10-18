import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Shared/Header'
import Loading from '../components/Shared/Loading'
import Spinner from '../components/Shared/Spinner'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface School {
  school_id: string
  name: string
  roles: string[]
}

interface Teacher {
  user_id: string
  full_name: string
}

interface Class {
  class_id: string
  name: string
  level: string
  day_of_week: number
  start_time: string
  end_time: string
  teachers: Teacher[]
}

interface Course {
  course_id: string
  date: string
  short_description: string
  created_at: string
}

const MyCourses = () => {
  const [schools, setSchools] = useState<School[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedSchool, setSelectedSchool] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('')

  const [loading, setLoading] = useState(true)
  const [classesLoading, setClassesLoading] = useState(false)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { user, isLoading, isInitializing } = useAuth()
  const navigate = useNavigate()

  // Show loading while initializing or if user data is being loaded
  if (isInitializing || isLoading) {
    return <Loading fullPage />
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
        
        // Auto-select first school if available
        if (data.length > 0) {
          setSelectedSchool(data[0].school_id)
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

  // Fetch classes when school changes
  useEffect(() => {
    const fetchClasses = async () => {
      if (!selectedSchool || !user?.access_token) return

      try {
        setClassesLoading(true)
        setError('')

        const apiUrl = `${API_BASE_URL}/classes/by-school/${selectedSchool}`
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user?.access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          
          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { message: errorText }
          }
          
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.')
          }
          if (response.status === 422 && errorData.detail) {
            const errorMessages = errorData.detail.map((err: any) => err.msg).join(', ')
            throw new Error(errorMessages)
          }
          throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch classes`)
        }
        
        const data = await response.json()
        setClasses(data)
        
        // Auto-select first class if available
        if (data.length > 0) {
          setSelectedClass(data[0].class_id)
        } else {
          setSelectedClass('')
          setCourses([])
        }
      } catch (err) {
        let errorMessage = 'Failed to fetch classes'
        
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the server.'
        } else if (err instanceof Error) {
          errorMessage = err.message
        }
        
        setError(errorMessage)
        toast.error(errorMessage)
        setClasses([])
        setSelectedClass('')
        setCourses([])
      } finally {
        setClassesLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchClasses, 100)
    return () => clearTimeout(timeoutId)
  }, [selectedSchool, user])

  // Fetch courses when class changes
  useEffect(() => {
    const fetchCourses = async () => {
      if (!selectedClass || !user?.access_token) return

      try {
        setCoursesLoading(true)
        setError('')

        const apiUrl = `${API_BASE_URL}/classes/${selectedClass}/courses`
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user?.access_token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          mode: 'cors'
        })
        
        if (!response.ok) {
          const errorText = await response.text()
          
          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch {
            errorData = { message: errorText }
          }
          
          if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.')
          }
          if (response.status === 422 && errorData.detail) {
            const errorMessages = errorData.detail.map((err: any) => err.msg).join(', ')
            throw new Error(errorMessages)
          }
          throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch courses`)
        }
        
        const data = await response.json()
        setCourses(data.courses || [])
      } catch (err) {
        let errorMessage = 'Failed to fetch courses'
        
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the server.'
        } else if (err instanceof Error) {
          errorMessage = err.message
        }
        
        setError(errorMessage)
        toast.error(errorMessage)
        setCourses([])
      } finally {
        setCoursesLoading(false)
      }
    }

    const timeoutId = setTimeout(fetchCourses, 100)
    return () => clearTimeout(timeoutId)
  }, [selectedClass, user])

  const copyCourseId = async (courseId: string) => {
    try {
      await navigator.clipboard.writeText(courseId)
      setCopiedId(courseId)
      toast.success('Course ID copied to clipboard!')
      
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedId(null)
      }, 2000)
    } catch (err) {
      toast.error('Failed to copy course ID')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return <Loading message="Loading courses..." fullPage />
  }

  return (
    <div className="min-h-screen bg-[#2E2E69] py-8 px-4">
      <Header />
      <div className="max-w-[375px] mx-auto mt-10">
        {/* Header */}
        <div className="bg-[#2E2E69] rounded-lg shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 p-6">
            <h1 className="text-3xl font-bold text-white text-center">My Courses</h1>
            <p className="text-white text-center mt-2 opacity-90">Browse courses from your classes</p>
          </div>
        </div>

        {/* School and Class Selection */}
        <div className="bg-[#2E2E69] rounded-lg shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* School Dropdown */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select School
              </label>
              <div className="relative">
                <select
                  value={selectedSchool}
                  onChange={(e) => setSelectedSchool(e.target.value)}
                  className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white px-4 pr-10 shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none appearance-none cursor-pointer"
                  disabled={schools.length === 0}
                >
                  <option value="">Select a school</option>
                  {schools.map((school) => (
                    <option key={school.school_id} value={school.school_id}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Class Dropdown */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select Class
              </label>
              <div className="relative">
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white px-4 pr-10 shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none appearance-none cursor-pointer"
                  disabled={classes.length === 0 || classesLoading}
                >
                  <option value="">Select a class</option>
                  {classes.map((classItem) => (
                    <option key={classItem.class_id} value={classItem.class_id}>
                      {classItem.name} - {classItem.level}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  {classesLoading ? (
                    <Spinner size="sm" color="purple" />
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>
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

        {/* Courses Loading */}
        {coursesLoading && (
          <Loading message="Loading courses..." />
        )}

        {/* No Selection State */}
        {!selectedClass && !coursesLoading && (
          <div className="bg-[#2E2E69] rounded-lg shadow-xl p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">Select a Class</h3>
            <p className="text-gray-300">Choose a school and class to view available courses.</p>
          </div>
        )}

        {/* No Courses Found */}
        {selectedClass && !coursesLoading && courses.length === 0 && (
          <div className="bg-[#2E2E69] rounded-lg shadow-xl p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">No Courses Found</h3>
            <p className="text-gray-300 mb-6">There are no courses available for the selected class.</p>
            <button
              onClick={() => navigate('/create-courses')}
              className="bg-[#BA40A466] text-white py-2 px-6 rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 font-medium"
            >
              Create Course
            </button>
          </div>
        )}

        {/* Courses Grid */}
        {selectedClass && !coursesLoading && courses.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {courses.map((course) => (
              <div 
                key={course.course_id} 
                className="bg-[#2E2E69] rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
                onClick={() => navigate(`/course-details/${course.course_id}`)}
              >
                {/* Course Header */}
                <div className="h-32 bg-gradient-to-br from-purple-400 to-purple-600 relative overflow-hidden">
                  <div className="flex items-center justify-center h-full">
                    <svg className="h-12 w-12 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>

                {/* Course Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white flex-1">Course </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyCourseId(course.course_id);
                      }}
                      className={`ml-3 flex items-center px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                        copiedId === course.course_id
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:text-gray-800'
                      }`}
                      title={`Copy Course ID: ${course.course_id}`}
                    >
                      {copiedId === course.course_id ? (
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

                  <p className="text-gray-400 mb-4 line-clamp-3">
                    {course.short_description || 'No description available'}
                  </p>

                  {/* Dates */}
                  <div className="space-y-2">
                    <p className="text-sm text-gray-200">
                      <span className='font-semibold'>Course Date:</span> {formatDate(course.date)}
                    </p>
                    <p className="text-sm text-gray-200">
                      <span className='font-semibold'>Created:</span> {formatDate(course.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyCourses