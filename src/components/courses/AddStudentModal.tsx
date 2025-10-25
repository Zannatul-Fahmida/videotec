import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'
import Spinner from '../Shared/Spinner'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface AddStudentModalProps {
  classId: string
  onStudentAdded: () => void
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({ classId, onStudentAdded }) => {
  const [studentId, setStudentId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()

  const handleAddStudent = async () => {
    if (!user || !classId || !studentId.trim()) return

    setLoading(true)
    setError('')

    try {
      // Try the original endpoint format first
      let response = await fetch(`${API_BASE_URL}/classes/${classId}/add-student/${studentId.trim()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        
        throw new Error(errorData.detail || `Failed to add student to class (Status: ${response.status})`)
      }
      
      toast.success('Student added to class successfully!')
      setStudentId('') 
      onStudentAdded() 
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add student to class'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Add student error:', err)
      console.error('API Base URL:', API_BASE_URL)
      console.error('Class ID:', classId)
      console.error('Student ID:', studentId.trim())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="mb-4 rounded-[12px] border border-red-400 bg-[#343472] text-red-200 px-4 py-3 text-sm shadow-[0_6px_12px_rgba(6,20,40,0.22)]">
          {error}
        </div>
      )}
      
      {/* Manual Student Entry Form */}
      <div className="space-y-4">
        <div className="text-white text-sm mb-4">
          <p className="mb-2">To add a student to this class, you need the student's ID.</p>
          <p className="text-white/70">Contact your administrator to get the student ID or implement a student search endpoint.</p>
        </div>
        
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="Enter Student ID..."
          className="w-full h-12 rounded-[18px] bg-[#6F6D95] text-white placeholder-white/80 px-4 shadow-[0_6px_12px_rgba(6,20,40,0.22)] border border-white/10 outline-none"
        />
        
        <button
          onClick={handleAddStudent}
          disabled={loading || !studentId.trim()}
          className="w-full bg-[#BA40A466] text-white py-3 px-6 rounded-full hover:bg-[#BA40A480] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Spinner size="xs" />
              <span>Adding Student...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Student to Class</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default AddStudentModal