import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Shared/Header'


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const CreateSchool = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()

  // Redirect to login if user is not authenticated
  if (!user) {
    navigate('/login')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.address) {
      setError('Both school name and address are required')
      toast.error('Both school name and address are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/schools/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        // Handle validation errors
        if (response.status === 422 && data.detail) {
          const errorMessages = data.detail.map((err: any) => err.msg).join(', ')
          throw new Error(errorMessages)
        }
        throw new Error(data.message || 'Failed to create school')
      }
      
      toast.success('School created successfully!')
      // Reset form
      setFormData({ name: '', address: '' })
      // Optionally navigate to a different page
      // navigate('/')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create school'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#272B69] py-8 px-4">
      <Header />
      <div className='md:max-w-[375px] mx-auto mt-10'>
      <h1 className="text-white text-2xl font-semibold tracking-wide">Create School</h1>

      <div className="md:max-w-[375px] mx-auto mt-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="mb-4 rounded-[12px] border border-red-400 bg-[#343472] text-red-200 px-4 py-3 text-sm shadow-[0_6px_12px_rgba(6,20,40,0.22)]">
                {error}
              </div>
            )}
            
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="School Name"
              className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white placeholder-white/80 px-4 shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none"
            />
            
            <div className="relative">
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="School Adress"
                className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white placeholder-white/80 px-4 pr-12 shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="9" r="2" fill="currentColor" />
                </svg>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => document.getElementById('logo-input')?.click()}
                className="mt-1 w-[170px] h-12 rounded-[24px] bg-[#BA40A466] text-white font-medium shadow-[0_6px_12px_rgba(6,20,40,0.22)] hover:opacity-95 focus:outline-none"
              >
                Add Logo
              </button>
              <input id="logo-input" type="file" accept="image/*" className="hidden" />
            </div>
            
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
    </div>
  )
}

export default CreateSchool