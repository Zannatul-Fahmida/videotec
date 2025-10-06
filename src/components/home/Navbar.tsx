import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
    // Prevent scrolling when menu is open
    document.body.style.overflow = isMenuOpen ? 'auto' : 'hidden'
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
    document.body.style.overflow = 'auto'
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
        <div className="text-center">
          <Link 
            to="/" 
            className="block text-black text-3xl font-bold mb-8 hover:text-black/80 transition-colors"
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link 
            to="/login" 
            className="block text-black text-3xl font-bold mb-8 hover:text-black/80 transition-colors"
            onClick={closeMenu}
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="block text-black text-3xl font-bold mb-8 hover:text-black/80 transition-colors"
            onClick={closeMenu}
          >
            Register
          </Link>
        </div>
      </div>
    </>
  )
}

export default Navbar
