import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import {
  getStudentId,
  saveStudentId as persistStudentId,
  clearStudentId as removeStudentId,
  validateStudentId,
} from "@/lib/studentId"
import { useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "@/lib/queryKeys"

interface StudentContextType {
  studentId: string
  setStudentId: (id: string) => void
  clearStudentId: () => void
  isValid: boolean
  validationError: string | null
}

const StudentContext = createContext<StudentContextType | undefined>(undefined)

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [studentId, setStudentIdState] = useState<string>(() => getStudentId() ?? "")

  const setStudentId = useCallback(
    (rawId: string) => {
      const cleaned = rawId.replace(/\D/g, "").slice(0, 17)
      setStudentIdState(cleaned)
      if (cleaned.length === 17) {
        try {
          persistStudentId(cleaned)
          void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.holds.me(cleaned) })
        } catch {
          // ignore
        }
      } else if (cleaned.length === 0) {
        removeStudentId()
      }
    },
    [queryClient]
  )

  const clearStudentId = useCallback(() => {
    setStudentIdState("")
    removeStudentId()
  }, [])

  useEffect(() => {
    const handleUpdate = () => {
      const current = getStudentId() ?? ""
      setStudentIdState(current)
    }
    window.addEventListener("storage", handleUpdate)
    window.addEventListener("student_id_updated", handleUpdate)
    return () => {
      window.removeEventListener("storage", handleUpdate)
      window.removeEventListener("student_id_updated", handleUpdate)
    }
  }, [])

  const isValid = studentId.length === 17
  const validationError = studentId ? validateStudentId(studentId) : null

  return (
    <StudentContext.Provider
      value={{
        studentId,
        setStudentId,
        clearStudentId,
        isValid,
        validationError,
      }}
    >
      {children}
    </StudentContext.Provider>
  )
}

export function useStudent() {
  const context = useContext(StudentContext)
  if (!context) {
    throw new Error("useStudent must be used within a StudentProvider")
  }
  return context
}
