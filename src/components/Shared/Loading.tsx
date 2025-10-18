import React from 'react'

interface LoadingProps {
  /** Loading message to display */
  message?: string
  /** Size of the loading spinner */
  size?: 'small' | 'medium' | 'large'
  /** Whether to show as full page overlay */
  fullPage?: boolean
  /** Custom className for additional styling */
  className?: string
}

const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  size = 'medium',
  fullPage = false,
  className = ''
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      spinner: 'h-6 w-6',
      text: 'text-sm'
    },
    medium: {
      spinner: 'h-8 w-8',
      text: 'text-base'
    },
    large: {
      spinner: 'h-12 w-12',
      text: 'text-lg'
    }
  }

  const currentSize = sizeConfig[size]

  const content = (
    <div className={`bg-[#2E2E69] text-white rounded-lg shadow-xl p-8 ${className}`}>
      <div className="flex items-center justify-center">
        <svg 
          className={`animate-spin ${currentSize.spinner} text-white mr-3`} 
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
        <span className={`font-medium ${currentSize.text}`}>{message}</span>
      </div>
    </div>
  )

  if (fullPage) {
    return (
      <div className="min-h-screen bg-[#2E2E69] flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}

export default Loading