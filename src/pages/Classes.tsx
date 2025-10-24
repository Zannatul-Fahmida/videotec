import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Loading from '../components/Shared/Loading'
import Header from '../components/Shared/Header'
import Modal from '../components/Shared/Modal'
import CreateClassModal from '../components/classes/CreateClassModal'
import profileImg from '../assets/profile.png'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

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

const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const { user, isLoading, isInitializing } = useAuth()
  const { schoolId } = useParams<{ schoolId: string }>()
  const navigate = useNavigate()
  const school_id = schoolId // For consistency with API calls

  // Show loading while initializing or if user data is being loaded
  if (isInitializing || isLoading) {
    return <Loading fullPage />
  }

  // Fetch classes for the specific school
  useEffect(() => {
    const fetchClasses = async () => {
      if (!school_id) {
        setError('School ID is required')
        setLoading(false)
        return
      }

      if (!user?.access_token) {
        setError('Authentication required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        
        const url = `${API_BASE_URL}/classes/by-school/${school_id}`
        console.log('Fetching from URL:', url)

        const response = await fetch(url, {
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
          throw new Error(data.message || 'Failed to fetch classes')
        }
        
        setClasses(data)
      } catch (err) {
        console.error('Fetch error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch classes'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchClasses()
  }, [school_id, user])

  const formatTime = (time: string) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getDayName = (dayNumber: number) => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    return days[dayNumber] || 'Inconnu'
  }

  if (loading) {
    return <Loading message="Chargement des cours..." fullPage />
  }

  return (
    <div className="min-h-screen bg-[#2E2E69] py-8 px-4">
      <Header />
      <div className="max-w-[375px] mx-auto mt-8">
        <div className='w-full flex items-center justify-center'><img src={profileImg} alt='Profile image' className='w-24 h-24 rounded-full' /></div>
        <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-[#C0BFC4]">Dan56t</h1>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
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
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {classes.length === 0 ? (
          <div className="bg-[#3F4851] rounded-lg shadow-xl p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">Aucun Cours Trouvé</h3>
            <p className="text-gray-300 mb-6">Aucun cours disponible pour cette école.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((classItem) => (
              <div
                key={classItem.class_id}
                className="bg-[#BA40A466] rounded-lg shadow-lg overflow-hidden relative text-[#C0BFC4] cursor-pointer"
                onClick={() => navigate(`/courses/${classItem.class_id}`)}
              >
                {/* Settings Icon - Top Right */}
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-3 right-3 w-8 h-8 text-white rounded-full flex items-center justify-center hover:text-gray-100 transition-colors duration-200 z-10 cursor-pointer"
                  aria-label="Settings"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>

                <div className="p-4">
                  {/* Class Name */}
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-bold">{classItem.name}</h3>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-graduation-cap-icon lucide-graduation-cap text-white ml-2"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>
                  </div>

                  {/* Teachers */}
                  <p className="text-sm mb-1">
                    <span className="font-medium">PROFESSEURS:</span> {classItem.teachers.length > 0 
                      ? classItem.teachers.map(t => t.full_name).join(', ')
                      : 'HAKIM MEDOUR'
                    }
                  </p>

                  {/* Level */}
                  <div className="text-sm mb-1 flex items-center">
                    <span className="font-medium mr-1">NIVEAU:</span>
                    {Array.from({ length: Number(classItem.level) }).map((_, idx) => (
                      <svg key={idx} className="w-3.5 h-3.5 text-[#CCCCCC] mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>

                  {/* Schedule */}
                  <p className="text-sm">
                    <span className="font-medium">HORAIRE:</span> {getDayName(classItem.day_of_week).toUpperCase()}, {formatTime(classItem.start_time)} - {formatTime(classItem.end_time)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Class"
        maxWidth="max-w-md"
      >
        <CreateClassModal 
          schoolId={school_id || ''} 
          onClassCreated={() => {
            setIsCreateModalOpen(false)
            // Refresh classes list
            window.location.reload()
          }} 
        />
      </Modal>
    </div>
  )
}

export default Classes