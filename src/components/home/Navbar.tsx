import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const { user, logout } = useAuth()
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  // Handle scroll event to add shadow and background opacity when scrolled
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Handle click outside profile dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isProfileDropdownOpen])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    // Prevent scrolling when menu is open
    document.body.style.overflow = isMenuOpen ? 'auto' : 'hidden'
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    setIsProfileDropdownOpen(false)
    document.body.style.overflow = 'auto'
  }

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen)
  }

  const handleLogout = async () => {
    await logout()
    closeMenu()
  }

  // Get user initials for profile avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <div 
        className={`fixed top-0 left-0 right-0 z-20 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md' : 'bg-white'
        }`}
      >
        <div className="container mx-auto flex justify-between items-center p-4">
          <div className="text-2xl font-bold text-black">
            <Link to="/" onClick={closeMenu}>Videotec</Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            {user ? (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center space-x-3 rounded-full cursor-pointer p-2 transition-all"
                >
                  <div className="w-10 h-10 bg-[#BA40A4] text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {getUserInitials(user.full_name)}
                  </div>
                </button>
                
                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                        to="/create-school"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={closeMenu}
                      >
                        Create School
                      </Link>
                    <Link
                        to="/my-schools"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={closeMenu}
                      >
                        My Schools
                      </Link>
                    <Link
                        to="/create-class"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={closeMenu}
                      >
                        Create Class
                      </Link>
                    <Link
                        to="/my-classes"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={closeMenu}
                      >
                        My Classes
                      </Link>
                    <Link
                        to="/create-courses"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={closeMenu}
                      >
                        Create Courses
                      </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="mr-4">
                  <Link to="/login" className="text-black hover:text-gray-600">
                    Login
                  </Link>
                </div>
                <div>
                  <Link to="/register" className="bg-[#BA40A4] text-white px-4 py-2 rounded-md hover:bg-[#BA40A4]/90 transition-all">
                    Register
                  </Link>
                </div>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden flex flex-col justify-center items-center w-8 h-8"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-black mb-1.5 transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-black mb-1.5 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
            <span className={`block w-6 h-0.5 bg-black transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>
      
      {/* Spacer to prevent content from going under the navbar */}
      <div className="h-16"></div>
      
      {/* Full Screen Overlay Menu */}
      <div 
        className={`fixed inset-0 bg-white z-10 flex flex-col items-center justify-center transition-all duration-300 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="text-center px-6">
          <Link 
            to="/" 
            className="block text-black text-2xl font-semibold mb-6 hover:text-black/80 transition-colors"
            onClick={closeMenu}
          >
            Home
          </Link>
          {user ? (
            <>
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {/* Mobile Profile Button */}
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex flex-col items-center focus:outline-none"
                  >
                    <div className="w-12 h-12 bg-[#BA40A4] text-white rounded-full flex items-center justify-center font-semibold text-base mb-2 cursor-pointer">
                      {getUserInitials(user.full_name)}
                    </div>
                  </button>
                  
                  {/* Mobile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-center"
                        onClick={closeMenu}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/create-school"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-center"
                        onClick={closeMenu}
                      >
                        Create School
                      </Link>
                      <Link
                        to="/my-schools"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-center"
                        onClick={closeMenu}
                      >
                        My Schools
                      </Link>
                      <Link
                        to="/create-class"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-center"
                        onClick={closeMenu}
                      >
                        Create Class
                      </Link>
                      <Link
                        to="/my-classes"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-center"
                        onClick={closeMenu}
                      >
                        My Classes
                      </Link>
                      <Link
                        to="/create-courses"
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-center"
                        onClick={closeMenu}
                      >
                        Create Courses
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-center"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="block text-black text-2xl font-semibold mb-6 hover:text-black/80 transition-colors"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="block text-black text-2xl font-semibold mb-6 hover:text-black/80 transition-colors"
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar
