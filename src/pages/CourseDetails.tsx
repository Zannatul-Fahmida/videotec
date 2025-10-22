import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Shared/Header'
import Loading from '../components/Shared/Loading'
import Spinner from '../components/Shared/Spinner'
import Modal from '../components/Shared/Modal'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface Course {
  course_id: string
  date: string
  short_description: string
  created_at: string
}

interface Video {
  video_id: string
  video_url: string
  video_type: string
  uploaded_by: {
    user_id: string
    full_name: string
  }
}

// Custom overlay video player matching the reference UI
const formatTime = (seconds: number) => {
  if (!isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

const CustomVideoPlayer: React.FC<{ src: string; title?: string }> = ({ src, title }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onLoaded = () => setDuration(v.duration || 0)
    const onTime = () => setCurrentTime(v.currentTime || 0)
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    v.addEventListener('loadedmetadata', onLoaded)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('play', onPlay)
    v.addEventListener('pause', onPause)
    return () => {
      v.removeEventListener('loadedmetadata', onLoaded)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('play', onPlay)
      v.removeEventListener('pause', onPause)
    }
  }, [])

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
    } else {
      v.pause()
    }
  }

  const skipBy = (seconds: number) => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = Math.max(0, Math.min(v.currentTime + seconds, v.duration || v.currentTime))
  }

  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setIsMuted(v.muted)
  }

  const enterPiP = async () => {
    const v = videoRef.current as any
    const pipDoc = document as any
    if (!v) return
    try {
      if (pipDoc.pictureInPictureEnabled && !pipDoc.pictureInPictureElement) {
        await v.requestPictureInPicture()
      }
    } catch (e) {
      console.warn('PiP not available', e)
    }
  }

  const toggleFullscreen = async () => {
    const v = videoRef.current as any
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else if (v && v.requestFullscreen) {
        await v.requestFullscreen()
      }
    } catch (e) {
      console.warn('Fullscreen error', e)
    }
  }

  return (
    <div className="relative w-full rounded-md overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full"
        preload="metadata"
        playsInline
      />

      {/* Top-right actions */}
      <div className="absolute top-3 right-3 flex gap-2">
        <button
          onClick={enterPiP}
          className="p-2 rounded-full bg-[#00000066] text-white hover:bg-[#00000099] transition"
          title="Picture-in-Picture"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6a3 3 0 013-3h12a3 3 0 013 3v6h-2V6a1 1 0 00-1-1H6a1 1 0 00-1 1v12a1 1 0 001 1h6v2H6a3 3 0 01-3-3V6z"></path>
            <rect x="13" y="13" width="8" height="6" rx="1"></rect>
          </svg>
        </button>
        <button
          onClick={toggleMute}
          className="p-2 rounded-full bg-[#00000066] text-white hover:bg-[#00000099] transition"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 9v6h4l5 5V4L9 9H5z"></path>
              <path d="M19 7l-2 2m0 0l-2 2m2-2l2 2m-2-2l-2-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 9v6h4l5 5V4L9 9H5z"></path>
              <path d="M16 7a5 5 0 010 10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          )}
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-full bg-[#00000066] text-white hover:bg-[#00000099] transition"
          title="Fullscreen"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h4V5H5v6h2V7zm10 0v4h2V5h-6v2h4zm0 10h-4v2h6v-6h-2v4zM7 17v-4H5v6h6v-2H7z"></path>
          </svg>
        </button>
      </div>

      {/* Center controls */}
      <div className="absolute inset-0 flex items-center justify-center gap-4 pointer-events-none">
        <button
          onClick={() => skipBy(-10)}
          className="pointer-events-auto p-2 md:p-3 rounded-full bg-[#00000066] text-white hover:bg-[#00000099] transition"
          title="Back 10s"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-left-icon lucide-chevron-left w-5 h-5"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <button
          onClick={togglePlay}
          className="pointer-events-auto p-3 md:p-4 rounded-full bg-[#00000066] text-white hover:bg-[#00000099] transition shadow-lg"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 5h4v14H6zM14 5h4v14h-4z"></path>
            </svg>
          ) : (
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 6v12l10-6-10-6z"></path>
            </svg>
          )}
        </button>
        <button
          onClick={() => skipBy(10)}
          className="pointer-events-auto p-2 md:p-3 rounded-full bg-[#00000066] text-white hover:bg-[#00000099] transition"
          title="Forward 10s"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-chevron-right-icon lucide-chevron-right w-5 h-5"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      </div>

      {/* Bottom overlay */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center justify-between bg-gradient-to-t from-[#00000099] to-transparent">
        <span className="text-white text-sm font-medium truncate">{title || 'Untitled Video'}</span>
        <span className="text-white text-sm text-nowrap">{`${formatTime(currentTime)} / ${formatTime(duration)}`}</span>
      </div>
    </div>
  )
}

const CourseDetails = () => {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [course, setCourse] = useState<Course | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!courseId) {
      navigate('/my-courses')
      return
    }
    fetchCourseDetails()
    fetchCourseVideos()
  }, [courseId])

  const fetchCourseDetails = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call when provided
      // Simulating course data for now
      const mockCourse: Course = {
        course_id: courseId!,
        date: '2024-01-15',
        short_description: 'This is a comprehensive dance course covering various techniques and styles.',
        created_at: '2024-01-10'
      }
      setCourse(mockCourse)
    } catch (err) {
      setError('Failed to fetch course details')
      console.error('Error fetching course:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourseVideos = async () => {
    try {
      if (!courseId || !user?.access_token) return
      
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/videos`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 422 && errorData.detail) {
          const errorMessages = errorData.detail.map((err: any) => err.msg).join(', ')
          throw new Error(errorMessages)
        }
        throw new Error(errorData.message || 'Failed to fetch videos')
      }

      const data = await response.json()
      setVideos(data)
    } catch (err) {
      console.error('Error fetching videos:', err)
      // Don't show error to user for videos fetch, just log it
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith('video/')) {
        setSelectedFile(file)
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
      } else {
        toast.error('Please select a valid video file')
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !courseId || !user?.access_token) {
      toast.error('Please select a video file')
      return
    }

    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/videos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.access_token}`
          // Don't set Content-Type for FormData, let browser set it with boundary
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 422 && errorData.detail) {
          const errorMessages = errorData.detail.map((err: any) => err.msg).join(', ')
          throw new Error(errorMessages)
        }
        throw new Error(errorData.message || 'Failed to upload video')
      }

      const data = await response.json()
      console.log(data)
      toast.success('Video uploaded successfully!')
      
      setIsUploadModalOpen(false)
      setSelectedFile(null)
      setPreviewUrl(null)
      fetchCourseVideos() // Refresh videos list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload video'
      toast.error(errorMessage)
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleCancelUpload = () => {
    setIsUploadModalOpen(false)
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#2E2E69] py-8 px-4">
        <Header />
        <div className="max-w-[375px] mx-auto pt-10">
          <Loading message="Loading course details..." />
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#2E2E69] py-8 px-4">
        <Header />
        <div className="md:max-w-[375px] mx-auto pt-10">
          <div className="bg-[#2E2E69] rounded-lg shadow-xl p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">Course Not Found</h3>
            <p className="text-gray-300 mb-6">{error || 'The requested course could not be found.'}</p>
            <button
              onClick={() => navigate('/my-courses')}
              className="bg-[#BA40A466] text-white py-2 px-6 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 font-medium"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#2E2E69] py-8 px-4">
      <Header />
      
      <div className="md:max-w-[375px] mx-auto pt-10 pb-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/my-courses')}
          className="flex items-center text-white mb-6 hover:text-purple-300 transition-colors duration-200"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Courses
        </button>

        {/* Course Details Card */}
        <div className="bg-[#2E2E69] rounded-lg shadow-xl overflow-hidden mb-8">
          {/* Course Header */}
          <div className="h-32 bg-gradient-to-br from-purple-400 to-purple-600 relative overflow-hidden">
            <div className="flex items-center justify-center h-full">
              <svg className="h-12 w-12 text-white opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          {/* Course Info */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-2xl font-bold text-white flex-1">Course Details</h1>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="ml-3 bg-[#BA40A466] text-white p-2 rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 shadow-lg"
                title="Upload Video"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">
              {course.short_description || 'No description available'}
            </p>

            {/* Course Metadata */}
            <div className="space-y-3 border-t border-gray-500 pt-4">
              <div className="flex items-center text-sm text-gray-200">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L15 7" />
                </svg>
                Course ID: {course.course_id}
              </div>
              <div className="flex items-center text-sm text-gray-200">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L15 7" />
                </svg>
                Course Date: {formatDate(course.date)}
              </div>
              <div className="flex items-center text-sm text-gray-200">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Created: {formatDate(course.created_at)}
              </div>
            </div>
          </div>
        </div>

        {/* Videos Section */}
        <div className="bg-[#BA40A466] rounded-lg shadow-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Course Videos</h2>
          
          {videos.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-white mb-2">No Videos Uploaded</h3>
              <p className="text-gray-200 mb-4">No videos have been uploaded for this course yet.</p>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-[#BA40A4] text-white py-2 px-6 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 font-medium"
              >
                Upload First Video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {videos.map((video) => (
                <div key={video.video_id}>
                  <div className="mb-3">
                    <h3 className="font-medium text-white mb-1">Video {video.video_id}</h3>
                    <p className="text-sm text-gray-200">Type: {video.video_type}</p>
                    <p className="text-sm text-gray-300">Uploaded by: {video.uploaded_by.full_name}</p>
                  </div>
                  {/* Video Player */}
                  <div className="mt-3">
                    <CustomVideoPlayer src={video.video_url} title={`Video ${video.video_id}`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={handleCancelUpload}
        title="Upload Video"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Select Video File
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Video Preview */}
          {previewUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <video
                src={previewUrl}
                controls
                className="w-full rounded-md"
                style={{ maxHeight: '200px' }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleCancelUpload}
              disabled={uploading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 bg-[#BA40A466] text-white py-2 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center"
            >
              {uploading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Uploading...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CourseDetails