import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Shared/Header'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const CreateCourses = () => {
  const [formData, setFormData] = useState({
    short_description: '',
    date: '',
    class_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // Redirect to login if user is not authenticated
  if (!user) {
    navigate('/login')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.short_description || !formData.date || !formData.class_id) {
      setError('All fields are required')
      toast.error('All fields are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const requestBody = {
        short_description: formData.short_description,
        date: formData.date,
        class_id: formData.class_id
      }

      const response = await fetch(`${API_BASE_URL}/courses/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()
      
      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.')
          toast.error('Authentication failed. Please log in again.')
          await logout()
          navigate('/login')
          return
        }
        // Handle validation errors
        if (response.status === 422 && data.detail) {
          const errorMessages = data.detail.map((err: any) => err.msg).join(', ')
          throw new Error(errorMessages)
        }
        throw new Error(data.message || 'Failed to create course')
      }
      
      toast.success('Course created successfully!')
      // Reset form
      setFormData({
        short_description: '',
        date: '',
        class_id: ''
      })
      // Optionally navigate to a different page
      // navigate('/')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create course'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#272B69] py-8 px-4">
      <Header />
      <div className="md:max-w-[375px] mx-auto mt-10">
        <h2 className="text-white text-2xl font-semibold tracking-wide">Create Course</h2>

        <div className="md:max-w-[375px] mx-auto mt-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="mb-4 rounded-[12px] border border-red-400 bg-[#343472] text-red-200 px-4 py-3 text-sm shadow-[0_6px_12px_rgba(6,20,40,0.22)]">
                {error}
              </div>
            )}

            {/* Course Description pill */}
            <input
              type="text"
              id="short_description"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              placeholder="Course Description"
              className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white placeholder-white/80 px-4 shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none"
            />

            {/* Date pill with calendar icon */}
            <div className="relative">
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white px-4 pr-12 appearance-none shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none"
              />
              <button
                type="button"
                aria-label="Open date picker"
                onClick={() => {
                  const el = document.getElementById('date') as any
                  if (el?.showPicker) el.showPicker()
                  else (el as HTMLInputElement)?.focus()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white cursor-pointer focus:outline-none"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth="2" />
                  <path d="M16 3v4M8 3v4M3 11h18" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Class ID pill */}
            <input
              type="text"
              id="class_id"
              name="class_id"
              value={formData.class_id}
              onChange={handleChange}
              placeholder="Class ID"
              className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white placeholder-white/80 px-4 shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none"
            />

            {/* Confirm pill */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-[24px] bg-[#6DC03C] text-[#2E2E69] font-medium py-3 px-4 shadow-[0_8px_16px_rgba(6,20,40,0.30)] hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateCourses