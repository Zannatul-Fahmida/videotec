import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Shared/Header'
import Loading from '../components/Shared/Loading'
import CreateCourses from '../components/courses/CreateCourses'
import AddStudentModal from '../components/courses/AddStudentModal'
import Modal from '../components/Shared/Modal'
import studentImg from '../assets/student.png'
import profileImg from '../assets/profile.png'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface Class {
  class_id: string
  name: string
  level: string
  short_description: string
}

interface Course {
  course_id: string
  short_description: string
  date: string
  created_at: string
}

interface Student {
  student_id: string
  full_name: string
  email: string
  profile_picture?: string
}

interface ApiResponse {
  class: Class
  courses: Course[]
}

const Courses = () => {
  const { classId } = useParams<{ classId: string }>()
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [classInfo, setClassInfo] = useState<Class | null>(null)
  const [loading, setLoading] = useState(true)
  const [studentsLoading, setStudentsLoading] = useState(false)
  const [error, setError] = useState('')
  const [studentsError, setStudentsError] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false)
  const { user, isLoading, isInitializing } = useAuth()
  const navigate = useNavigate()

  // Show loading while initializing or if user data is being loaded
  if (isInitializing || isLoading) {
    return <Loading fullPage />
  }

  // Fetch courses for the specific class
  useEffect(() => {
    if (!user || !classId) return

    const fetchCourses = async () => {
      try {
        setLoading(true)
        setError('')

        const response = await fetch(`${API_BASE_URL}/classes/${classId}/courses`, {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'Content-Type': 'application/json'
          }
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
        
        const data: ApiResponse = await response.json()
        setCourses(data.courses || [])
        setClassInfo(data.class || null)
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
        setLoading(false)
      }
    }

    fetchCourses()
  }, [classId, user])

  // Fetch students for the specific class
  useEffect(() => {
    if (!user || !classId) return

    const fetchStudents = async () => {
      try {
        setStudentsLoading(true)
        setStudentsError('')

        const response = await fetch(`${API_BASE_URL}/classes/${classId}/students`, {
          headers: {
            'Authorization': `Bearer ${user.access_token}`,
            'Content-Type': 'application/json'
          }
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
          throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch students`)
        }
        
        const data: Student[] = await response.json()
        setStudents(data || [])
      } catch (err) {
        let errorMessage = 'Failed to fetch students'
        
        if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to connect to the server.'
        } else if (err instanceof Error) {
          errorMessage = err.message
        }
        
        setStudentsError(errorMessage)
        toast.error(errorMessage)
        setStudents([])
      } finally {
        setStudentsLoading(false)
      }
    }

    fetchStudents()
  }, [classId, user])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }
    return date.toLocaleDateString('fr-FR', options)
  }

  const handleCourseCreated = () => {
    setIsCreateModalOpen(false)
    // Refresh courses list
    window.location.reload()
  }

  const handleStudentAdded = () => {
    setIsAddStudentModalOpen(false)
    // Refresh students list by calling the fetch function again
    if (user && classId) {
      const fetchStudents = async () => {
        try {
          setStudentsLoading(true)
          setStudentsError('')

          const response = await fetch(`${API_BASE_URL}/classes/${classId}/students`, {
            headers: {
              'Authorization': `Bearer ${user.access_token}`,
              'Content-Type': 'application/json'
            }
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
            throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch students`)
          }
          
          const data: Student[] = await response.json()
          setStudents(data || [])
        } catch (err) {
          let errorMessage = 'Failed to fetch students'
          
          if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
            errorMessage = 'Network error: Unable to connect to the server.'
          } else if (err instanceof Error) {
            errorMessage = err.message
          }
          
          setStudentsError(errorMessage)
          toast.error(errorMessage)
          setStudents([])
        } finally {
          setStudentsLoading(false)
        }
      }

      fetchStudents()
    }
  }

  if (loading) {
    return <Loading message="Loading courses..." fullPage />
  }

  return (
    <div className="min-h-screen bg-[#2E2E69] py-8 px-4">
      <Header />
      <div className="max-w-[375px] mx-auto mt-8">
        <div className='w-full flex items-center justify-center'><img src={profileImg} alt='Profile image' className='w-24 h-24 rounded-full' /></div>
        {/* Header with Class Name and Plus Button */}
          <div className="flex items-center justify-between text-[#C0BFC4] font-semibold">
            <div>
              <h1 className="text-3xl">{classInfo?.name || 'Danset'}</h1>
              <p className="text-2xl">{classInfo?.short_description || 'Break Dance'}</p>
              <div className="flex items-center mt-2">
                <span className="text-xs uppercase tracking-wide">PROFESSEUR: <span className='font-normal'>HAKIM MEDOUR</span></span>
              </div>
              <div className="flex items-center mt-1">
                <span className="text-xs uppercase tracking-wide">NIVEAU: </span>
                <div className="flex ml-2">
                  {[...Array(parseInt(classInfo?.level || '5'))].map((_, i) => (
                    <svg key={i} className="w-3 h-3 text-[#CCCCCC] fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <div className="flex items-center mt-1">
                <span className="text-white/60 text-xs uppercase tracking-wide">HORAIRE: <span className='font-normal'>LUNDI, 20H30-21H30</span></span>
              </div>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
            >
              <svg className="w-5 h-5 text-[#2E2E69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        <div className="flex items-center justify-end">
                  <button className="text-white rounded-full w-10 h-10 flex items-center justify-center hover:text-gray-100 transition-colors duration-200 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 lucide lucide-calculator-icon lucide-calculator"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
                  </button>
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

        {/* Course Cards */}
        {courses.length > 0 ? (
          <div className="space-y-4">
            {courses.map((course) => (
              <div 
                key={course.course_id} 
                className="bg-[#BA40A466] rounded-lg p-4 cursor-pointer hover:bg-[#BA40A480] transition-all duration-300"
                onClick={() => navigate(`/course-details/${course.course_id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-[#C0BFC4] font-semibold text-xl capitalize">{formatDate(course.date)}</h3>
                    <p className="text-[#C0BFC4] font-semibold text-xs mt-1 capitalize tracking-wide">{course.short_description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#2E2E69] rounded-lg shadow-xl p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">No Courses Found</h3>
            <p className="text-gray-300 mb-6">There are no courses available for this class.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#BA40A466] text-white py-2 px-6 rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 font-medium"
            >
              Create Course
            </button>
          </div>
        )}

        {/* Students List Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-center font-semibold uppercase tracking-wide w-full">Listes des élèves</h2>
            <button 
              onClick={() => setIsAddStudentModalOpen(true)}
              className="bg-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
            >
              <svg className="w-5 h-5 text-[#2E2E69]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          {studentsError && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm mb-4">
              <div className="flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {studentsError}
              </div>
            </div>
          )}

          {studentsLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-2 text-white">Loading students...</span>
            </div>
          ) : students.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {students.map((student) => (
                <div key={student.student_id} className="flex items-center space-x-3">
                  {student.profile_picture ? (
                    <img src={student.profile_picture} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <img src={studentImg} alt="Profile" className="w-8 h-8 rounded-full" />
                  )}
                  <span className="text-white text-sm uppercase">{student.full_name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-white mb-2">No Students Found</h3>
              <p className="text-gray-300">There are no students enrolled in this class.</p>
            </div>
          )}
        </div>

        {/* Create Course Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Course"
          maxWidth="max-w-md"
        >
          <CreateCourses 
            classId={classId || ''} 
            onCourseCreated={handleCourseCreated}
          />
        </Modal>

        {/* Add Student Modal */}
        <Modal
          isOpen={isAddStudentModalOpen}
          onClose={() => setIsAddStudentModalOpen(false)}
          title="Add Student to Class"
          maxWidth="max-w-md"
        >
          <AddStudentModal 
            classId={classId || ''} 
            onStudentAdded={handleStudentAdded}
          />
        </Modal>
      </div>
    </div>
  )
}

export default Courses