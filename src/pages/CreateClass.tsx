import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const CreateClass = () => {
  const [formData, setFormData] = useState({
    name: '',
    short_description: '',
    level: '',
    day_of_week: '',
    start_time: '',
    end_time: '',
    school_id: ''
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.short_description || !formData.level || 
        !formData.day_of_week || !formData.start_time || !formData.end_time || !formData.school_id) {
      setError('All fields are required')
      toast.error('All fields are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Convert day_of_week to number and format times
      const requestBody = {
        name: formData.name,
        level: formData.level,
        short_description: formData.short_description,
        day_of_week: parseInt(formData.day_of_week),
        start_time: `${formData.start_time}:52.920Z`,
        end_time: `${formData.end_time}:52.920Z`,
        school_id: formData.school_id
      }

      const response = await fetch(`${API_BASE_URL}/classes/`, {
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
        throw new Error(data.message || 'Failed to create class')
      }
      
      toast.success('Class created successfully!')
      // Reset form
      setFormData({
        name: '',
        short_description: '',
        level: '',
        day_of_week: '',
        start_time: '',
        end_time: '',
        school_id: ''
      })
      // Optionally navigate to a different page
      // navigate('/')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create class'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const daysOfWeek = [
    { value: '1', label: '1 day per week' },
    { value: '2', label: '2 days per week' },
    { value: '3', label: '3 days per week' },
    { value: '4', label: '4 days per week' },
    { value: '5', label: '5 days per week' },
    { value: '6', label: '6 days per week' },
    { value: '7', label: '7 days per week' }
  ]

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-purple-500 p-6">
          <h2 className="text-3xl font-bold text-white text-center">Create Class</h2>
          <p className="text-white text-center mt-2 opacity-90">Add a new class to the system</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md text-sm">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            {/* First row: Course Name, School Description, Course Level */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter course name"
                />
              </div>
              
              <div>
                <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
                  School Description
                </label>
                <input
                  type="text"
                  id="short_description"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter description"
                />
              </div>
              
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                  Course Level
                </label>
                <input
                  type="text"
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter course level"
                />
              </div>
            </div>

            {/* Second row: Days, Starting Time, End Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-1">
                  Days
                </label>
                <select
                   id="day_of_week"
                   name="day_of_week"
                   value={formData.day_of_week}
                   onChange={handleChange}
                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                 >
                   <option value="">Select frequency</option>
                   {daysOfWeek.map(day => (
                     <option key={day.value} value={day.value}>
                       {day.label}
                     </option>
                   ))}
                 </select>
              </div>
              
              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Starting Time
                </label>
                <input
                  type="time"
                  id="start_time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  id="end_time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* School ID field */}
            <div>
              <label htmlFor="school_id" className="block text-sm font-medium text-gray-700 mb-1">
                School ID
              </label>
              <input
                type="text"
                id="school_id"
                name="school_id"
                value={formData.school_id}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter school ID"
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#BA40A4] text-white py-3 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 font-medium"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : 'Confirm'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateClass