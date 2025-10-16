import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      toast.error('Passwords do not match')
      return
    }

    if (!formData.full_name || !formData.date_of_birth || !formData.email || !formData.password) {
      setError('All fields are required')
      toast.error('All fields are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          date_of_birth: formData.date_of_birth,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      toast.success('Registration successful! Please login to your account.')
      navigate('/login')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#2E2E69] flex items-center justify-center px-4 py-10">
      <div className="md:max-w-[375px] bg-[#2E2E69] rounded-[40px]">
        <div className="text-center">
          <div className="font-poppins uppercase tracking-[0.15em] text-[36px] font-semibold text-[#C0BFC4]">Videotec</div>
        </div>

        <div className="mt-12 space-y-2">
          <div className="font-roboto text-sm font-semibold tracking-[0.0714em] uppercase text-[#BA40A4]">Welcome</div>
          <h2 className="font-roboto text-[30px] font-bold tracking-[-0.03em] text-[#D9D9D9]">Create An Account</h2>
          <p className="font-roboto text-[16px] text-[#8C8E97]">Fill the details below to create an account.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          {error && (
            <div className="mb-4 text-sm text-red-300 font-roboto">{error}</div>
          )}

          <div className="space-y-2.5">
            {/* Full Name */}
            <div className="relative w-[325px] h-[55px]">
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full bg-transparent text-[#D9D9D9] placeholder-[#D9D9D9] px-6 pr-12 font-roboto text-[14px] border border-[#8C8E97] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] focus:outline-none"
                placeholder="Full Name"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#D9D9D9]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            {/* Date of Birth */}
            <div className="relative w-full h-[55px]">
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full bg-transparent text-[#D9D9D9] placeholder-[#D9D9D9] px-6 font-roboto text-[14px] border border-[#8C8E97] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="relative w-[325px] h-[55px]">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full bg-transparent text-[#D9D9D9] placeholder-[#D9D9D9] px-6 pr-12 font-roboto text-[14px] border border-[#8C8E97] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] focus:outline-none"
                placeholder="Email Address"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#D9D9D9]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 6l9 7 9-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Password */}
            <div className="relative w-[325px] h-[55px]">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full bg-transparent text-[#D9D9D9] placeholder-[#D9D9D9] px-6 pr-12 font-roboto text-[14px] border border-[#8C8E97] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] focus:outline-none"
                placeholder="Create Password"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#D9D9D9]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 11V9a6 6 0 1112 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="12" cy="16" r="2" fill="currentColor"/>
              </svg>
            </div>

            {/* Confirm Password */}
            <div className="relative w-[325px] h-[55px]">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full bg-transparent text-[#D9D9D9] placeholder-[#D9D9D9] px-6 pr-12 font-roboto text-[14px] border border-[#8C8E97] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] focus:outline-none"
                placeholder="Confirm Password"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#D9D9D9]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 11V9a6 6 0 1112 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="12" cy="16" r="2" fill="currentColor"/>
              </svg>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-6 w-[323px]">
            <button
              type="submit"
              disabled={loading}
              className="w-[323px] h-[49px] rounded-full bg-[rgba(186,64,164,0.4)] text-white font-roboto text-[16px] font-medium focus:outline-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Registering...
                </span>
              ) : 'Sign Up'}
            </button>
          </div>

          {/* Footer CTA */}
          <div className="mt-8 text-center">
            <span className="font-poppins text-[16px] text-white">Already have an account? </span>
            <Link to="/login" className="font-poppins text-[16px] text-[rgba(186,64,164,0.4)] underline">Sign in</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register