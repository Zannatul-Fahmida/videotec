import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

interface HeaderProps {
  title: string
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false)
  }

  const closeMenu = () => setIsOpen(false)

  return (
    <div className="md:max-w-[375px] mx-auto flex items-center justify-between">
      <button
        type="button"
        aria-label="Notifications"
        className="relative p-2 rounded-full hover:bg-white/10 focus:outline-none"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3a2.002 2.002 0 01-.595 1.405L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </button>

      <div className="text-white font-poppins text-[18px] font-semibold">{title}</div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-white/10 focus:outline-none"
          onClick={() => setIsOpen(v => !v)}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-controls="header-menu"
          aria-label="Open menu"
          onKeyDown={handleKeyDown}
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {isOpen && (
          <div
            id="header-menu"
            role="menu"
            className="absolute right-0 mt-2 w-[280px] rounded-[16px] border border-[#8C8E97] bg-[#2E2E69] shadow-[0_4px_4px_rgba(0,0,0,0.25)] p-3 z-50"
          >
            <ul className="space-y-1">
              <li>
                <Link
                  to="/profile"
                  className="block w-full text-left font-poppins text-lg font-semibold tracking-[0.15em] capitalize text-[#C0BFC4] hover:text-white py-1 focus:outline-none"
                  onClick={closeMenu}
                  role="menuitem"
                >
                  profile
                </Link>
              </li>
              <li>
                <Link
                  to="/create-school"
                  className="block w-full text-left font-poppins text-lg font-semibold tracking-[0.15em] capitalize text-[#C0BFC4] hover:text-white py-1 focus:outline-none"
                  onClick={closeMenu}
                  role="menuitem"
                >
                  create school
                </Link>
              </li>
              <li>
                <Link
                  to="/create-class"
                  className="block w-full text-left font-poppins text-lg font-semibold tracking-[0.15em] capitalize text-[#C0BFC4] hover:text-white py-1 focus:outline-none"
                  onClick={closeMenu}
                  role="menuitem"
                >
                  create class
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default Header