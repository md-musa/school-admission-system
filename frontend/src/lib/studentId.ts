import { STORAGE_KEYS } from "@/constants/storageKeys"

/** Regex: exactly 17 numeric digits, stored as a string. */
const STUDENT_ID_REGEX = /^\d{17}$/

/**
 * Returns the stored student ID, or null if absent / invalid.
 * Always returns a string — never a number.
 */
export function getStudentId(): string | null {
  const id = localStorage.getItem(STORAGE_KEYS.STUDENT_ID)
  if (id && STUDENT_ID_REGEX.test(id)) return id
  return null
}

/**
 * Persists a valid student ID to localStorage as a string.
 * Throws if the value is not exactly 17 numeric digits.
 */
export function saveStudentId(id: string): void {
  if (!STUDENT_ID_REGEX.test(id)) {
    throw new Error("Student ID must be exactly 17 numeric digits.")
  }
  localStorage.setItem(STORAGE_KEYS.STUDENT_ID, id)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("student_id_updated"))
  }
}

/** Removes the student ID from localStorage. */
export function clearStudentId(): void {
  localStorage.removeItem(STORAGE_KEYS.STUDENT_ID)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("student_id_updated"))
  }
}

/**
 * Validates a raw string input.
 * Returns a human-readable error message, or null when valid.
 */
export function validateStudentId(raw: string): string | null {
  if (!raw.trim()) return "Student ID is required."
  if (!/^\d+$/.test(raw)) return "Student ID must contain digits only."
  if (raw.length < 17) return `Student ID must be 17 digits (${raw.length} entered).`
  if (raw.length > 17) return `Student ID must be 17 digits (${raw.length} entered).`
  return null // valid
}
