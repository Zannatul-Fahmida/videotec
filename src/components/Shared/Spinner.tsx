import React from 'react'

interface SpinnerProps {
  /** Size of the spinner */
  size?: 'xs' | 'sm' | 'md'
  /** Color of the spinner */
  color?: 'white' | 'purple' | 'gray'
  /** Custom className for additional styling */
  className?: string
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'sm',
  color = 'white',
  className = ''
}) => {
  // Size configurations
  const sizeConfig = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5'
  }

  // Color configurations
  const colorConfig = {
    white: 'text-white',
    purple: 'text-purple-600',
    gray: 'text-gray-600'
  }

  return (
    <svg 
      className={`animate-spin ${sizeConfig[size]} ${colorConfig[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

export default Spinner