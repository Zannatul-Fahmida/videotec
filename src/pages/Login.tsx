import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Spinner from '../components/Shared/Spinner'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
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
    
    if (!formData.email || !formData.password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password)
      toast.success('Login successful! Welcome back!')
      navigate('/')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#2E2E69] flex items-center justify-center px-4 py-6">
      <div className="md:max-w-[375px] bg-[#2E2E69] rounded-[40px]">
        <div className="text-center">
          <div className="font-poppins uppercase tracking-[0.15em] text-[36px] font-semibold text-[#C0BFC4]">Videotec</div>
        </div>

        <div className="mt-12 space-y-2">
          <div className="font-roboto text-sm font-semibold tracking-[0.0714em] uppercase text-[#BA40A4]">WELCOME BACK!</div>
          <h2 className="font-roboto text-[30px] font-bold tracking-[-0.03em] text-[#D9D9D9]">Let’s Sign In</h2>
          <p className="font-roboto text-[16px] text-[#8C8E97]">Continue with email address and password.</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8">
          {error && (
            <div className="mb-4 text-sm text-red-300 font-roboto">{error}</div>
          )}

          <div className="space-y-2.5">
            {/* Email field */}
            <div className="relative w-full h-[55px]">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full bg-transparent text-[#D9D9D9] placeholder-[#D9D9D9] px-6 pr-12 font-roboto text-[14px] border border-[#8C8E97] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] focus:outline-none"
                placeholder="Email"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#D9D9D9]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 6l9 7 9-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Password field */}
            <div className="relative w-full h-[55px]">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="absolute inset-0 w-full h-full bg-transparent text-[#D9D9D9] placeholder-[#D9D9D9] px-6 pr-12 font-roboto text-[14px] border border-[#8C8E97] rounded-[20px] shadow-[0_4px_4px_rgba(0,0,0,0.25)] focus:outline-none"
                placeholder="Enter Password"
              />
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#D9D9D9]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 11V9a6 6 0 1112 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="12" cy="16" r="2" fill="currentColor"/>
              </svg>
            </div>
          </div>

          {/* Remember / Forgot */}
          <div className="mt-4 w-full flex items-center justify-between">
            <label htmlFor="remember" className="flex items-center gap-2 font-roboto text-[#8C8E97] text-[16px]">
              <input id="remember" type="checkbox" className="peer sr-only" />
              <span className="inline-flex w-[25px] h-[25px] rounded-[5px] bg-[#8C8C8C] items-center justify-center">
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5.5l4 4 8-8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              Remeber Me
            </label>
            <Link to="/forgot-password" className="font-roboto text-[14px] font-medium tracking-[-0.035em] text-[rgba(186,64,164,0.4)] underline">
              Forgot Password?
            </Link>
          </div>

          {/* Sign In button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[49px] rounded-full bg-[rgba(186,64,164,0.4)] text-white font-roboto text-[16px] font-medium focus:outline-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Spinner size="sm" className="mr-2" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </div>

          {/* Footer CTA */}
          <div className="mt-8 text-center">
            <span className="font-poppins text-[16px] text-white">Don’t have an account? </span>
            <Link to="/register" className="font-poppins text-[16px] text-[rgba(186,64,164,0.4)] underline">Create Account</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login