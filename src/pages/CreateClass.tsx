import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'

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
    { value: '1', label: '1 day/wk' },
    { value: '2', label: '2 days/wk' },
    { value: '3', label: '3 days/wk' },
    { value: '4', label: '4 days/wk' },
    { value: '5', label: '5 days/wk' },
    { value: '6', label: '6 days/wk' },
    { value: '7', label: '7 days/wk' }
  ]

  return (
    <div className="min-h-screen bg-[#272B69] py-8 px-4">
<Header title='Create Class' />
      <div className="md:max-w-[375px] mx-auto">
      <h1 className="text-white text-2xl font-semibold tracking-wide mt-10 mb-8">Create Class</h1>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="mb-4 rounded-[12px] border border-red-400 bg-[#343472] text-red-200 px-4 py-3 text-sm shadow-[0_6px_12px_rgba(6,20,40,0.22)]">
                {error}
              </div>
            )}
            
            {/* Pill inputs matching screenshot */}
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Course Name"
              className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white placeholder-white/80 px-4 shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none"
            />

            <input
              type="text"
              id="short_description"
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              placeholder="Course Name"
              className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white placeholder-white/80 px-4 shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none"
            />

            <div className="relative">
              <input
                type="text"
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                placeholder="Select Level    X X X X X"
                className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white placeholder-white/80 px-4 pr-12 shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="9" r="2" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Days / Starting / End chips */}
            <div className="mt-3 grid grid-cols-3 gap-3">
              <div className="relative">
                <select
                  id="day_of_week"
                  name="day_of_week"
                  value={formData.day_of_week}
                  onChange={handleChange}
                  className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white text-sm px-4 appearance-none pr-6 shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none"
                >
                  <option value="">Days</option>
                  {daysOfWeek.map(day => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <input
                  type="time"
                  id="start_time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white px-3 pr-6 appearance-none shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none"
                />
                <button
                   type="button"
                   aria-label="Open time picker"
                   onClick={() => {
                     const el = document.getElementById('start_time') as any
                     if (el?.showPicker) el.showPicker()
                     else (el as HTMLInputElement)?.focus()
                   }}
                   className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white cursor-pointer focus:outline-none"
                 >
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                     <circle cx="12" cy="12" r="10" strokeWidth="2" />
                     <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                   </svg>
                 </button>
              </div>
              <div className="relative">
                <input
                  type="time"
                  id="end_time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white px-3 pr-6 appearance-none shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none"
                />
                <button
                   type="button"
                   aria-label="Open time picker"
                   onClick={() => {
                     const el = document.getElementById('end_time') as any
                     if (el?.showPicker) el.showPicker()
                     else (el as HTMLInputElement)?.focus()
                   }}
                   className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white cursor-pointer focus:outline-none"
                 >
                   <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                     <circle cx="12" cy="12" r="10" strokeWidth="2" />
                     <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                   </svg>
                 </button>
              </div>
            </div>

            {/* School ID field pill */}
            <input
              type="text"
              id="school_id"
              name="school_id"
              value={formData.school_id}
              onChange={handleChange}
              placeholder="School ID"
              className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white placeholder-white/80 px-4 shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none"
            />
            
            {/* Add Teacher button and selected name */}
            <div className="flex justify-end">
              <button
                type="button"
                className="mt-2 w-[170px] h-12 rounded-[24px] bg-[#BA40A466] text-white font-medium shadow-[0_6px_12px_rgba(6,20,40,0.22)] hover:opacity-95 focus:outline-none"
              >
                Add Teacher
              </button>
            </div>
            {/* <div className="mt-3 text-white font-medium">Lise Vignaud</div> */}
            
            {/* Confirm */}
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
                ) : 'Confirm'}
              </button>
            </div>
          </form>
      </div>
    </div>
  )
}

export default CreateClass