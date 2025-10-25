import React, { useRef } from 'react'
import toast from 'react-hot-toast'
import Modal from './Shared/Modal'

interface ProfilePictureModalProps {
  isOpen: boolean
  onClose: () => void
  currentImage: string | null
  onImageUpload: (imageUrl: string) => void
  onImageDelete: () => void
}

const ProfilePictureModal: React.FC<ProfilePictureModalProps> = ({
  isOpen,
  onClose,
  currentImage,
  onImageUpload,
  onImageDelete
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        onImageUpload(imageUrl)
        toast.success('Profile image updated!')
        onClose()
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDelete = () => {
    onImageDelete()
    toast.success('Profile image removed!')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile Picture"
      maxWidth="max-w-sm"
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Current Image Preview */}
        <div className="w-32 h-32 rounded-full bg-[#1EC9C7] overflow-hidden shadow-lg flex items-center justify-center">
          {currentImage ? (
            <img src={currentImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col w-full space-y-3">
          {/* Upload Button */}
          <button
            onClick={handleUploadClick}
            className="w-full h-11 rounded-full bg-gradient-to-b from-[#1EC9C7] to-[#17A2A0] text-white font-medium shadow-lg hover:opacity-95 transition-opacity duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {currentImage ? 'Change Picture' : 'Upload Picture'}
          </button>

          {/* Delete Button - Only show if there's an image */}
          {currentImage && (
            <button
              onClick={handleDelete}
              className="w-full h-11 rounded-full bg-gradient-to-b from-[#E53935] to-[#B82421] text-white font-medium shadow-lg hover:opacity-95 transition-opacity duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Picture
            </button>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
    </Modal>
  )
}

export default ProfilePictureModal