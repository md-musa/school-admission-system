import apiClient from "@/api/axios"
import { CLASSES_LIST, CLASSES_DETAIL, CLASSES_CREATE } from "@/api/endpoints"

export interface CreateClassPayload {
  name: string
  totalSeats: number
}

export interface ClassItem {
  id: string
  name: string
  totalSeats: number
  heldSeats: number
  confirmedSeats: number
  availableSeats: number
}

/**
 * Creates a new admission class (e.g. "Class 6 – Morning Shift").
 */
export async function createClass(data: CreateClassPayload): Promise<ClassItem> {
  const response = await apiClient.post<ClassItem>(CLASSES_CREATE, data)
  return response.data
}

/**
 * Fetch all available classes from the backend.
 * Returns the response data array directly.
 * Error handling is delegated to the Axios response interceptor.
 */
export async function getClasses(): Promise<ClassItem[]> {
  const response = await apiClient.get<ClassItem[]>(CLASSES_LIST)
  return response.data
}

/**
 * Fetch a single class by ID.
 * Returns the response data object directly.
 * Error handling (including 404) is delegated to the Axios response interceptor.
 */
export async function getClassById(classId: string): Promise<ClassItem> {
  const response = await apiClient.get<ClassItem>(CLASSES_DETAIL(classId))
  return response.data
}
