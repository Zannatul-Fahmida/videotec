import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Shared/Header'
import Loading from '../components/Shared/Loading'
import Spinner from '../components/Shared/Spinner'
import Modal from '../components/Shared/Modal'
import Comments from '../components/Comments'
import profileImg from '../assets/profile.png'

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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left-icon lucide-chevron-left w-5 h-5"><path d="m15 18-6-6 6-6"/></svg>
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
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right-icon lucide-chevron-right w-5 h-5"><path d="m9 18 6-6-6-6"/></svg>
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
      <div className="max-w-[375px] mx-auto pt-8 pb-10">
        <div className='w-full flex items-center justify-center'><img src={profileImg} alt='Profile image' className='w-24 h-24 rounded-full' /></div>
        {/* Header Section */}
          <div className="flex flex-col">
              <h1 className="text-[#C0BFC4] text-3xl font-semibold">Dans6t</h1>
              <p className="text-[#C0BFC4] text-2xl font-semibold">Break Dance</p>
          </div>

        {/* Teacher Info */}
        <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[#C0BFC4] text-sm">PROFESSEUR: HAKIM MEDOUR</p>
          <div className="flex items-center mt-1">
            <span className="text-[#C0BFC4] text-sm mr-1">NIVEAU:</span>
            <div className="flex">
              {[1].map((star) => (
                <svg
                  key={star}
                  className="w-4 h-4 text-[#CCCCCC] fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
        
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
            title="Upload Video"
          >
            <svg className="w-5 h-5 text-[#2E2E69]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {/* Date Display */}
        <div className="mb-6 text-center">
          <h2 className="text-[#C0BFC4] text-2xl font-semibold">Lundi 12 Janvier 2025</h2>
        </div>

        {/* Video Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[#C0BFC4] text-sm font-medium">DEMO</h3>
          </div>
          
          {videos.length > 0 ? (
            <div className="space-y-4">
              {videos.map((video) => (
                <div key={video.video_id} className="relative rounded-lg overflow-hidden">
                  <CustomVideoPlayer 
                    src={video.video_url} 
                    title="Demo Video"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden bg-gray-800 aspect-video flex items-center justify-center">
              <div className="text-center">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a2 2 0 012-2h8a2 2 0 012 2v2M7 16h10a2 2 0 002-2V8a2 2 0 00-2-2H7a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-400 text-sm">No demo video available</p>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="mt-3 bg-[#BA40A4] text-white py-2 px-4 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 font-medium text-sm"
                >
                  Upload Video
                </button>
              </div>
              <div className="absolute bottom-4 left-4 text-white text-xs opacity-80">
                Dany Loko Prod
              </div>
              <div className="absolute bottom-4 right-4 text-white text-xs opacity-80">
                0 of 3
              </div>
            </div>
          )}
        </div>

      {/* Comments Section */}
      <Comments />
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={handleCancelUpload}
        title="Upload Video"
        maxWidth="max-w-md"
      >
        <div className="space-y-5">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Select Video File
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="w-full h-auto rounded-[18px] bg-[#6F6D95] text-white placeholder-white/80 px-4 py-2 shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/20 file:text-white hover:file:bg-white/30"
            />
          </div>

          {/* Video Preview */}
          {previewUrl && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Preview
              </label>
              <video
                src={previewUrl}
                controls
                className="w-full rounded-[12px] shadow-[0_6px_12px_rgba(6,20,40,0.22)]"
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
              className="flex-1 h-12 rounded-[24px] bg-[#6F6D95] text-white font-medium shadow-[0_6px_12px_rgba(6,20,40,0.22)] hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 h-12 rounded-[24px] bg-[#6DC03C] text-[#2E2E69] font-medium shadow-[0_8px_16px_rgba(6,20,40,0.30)] hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all disabled:opacity-50 flex items-center justify-center"
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