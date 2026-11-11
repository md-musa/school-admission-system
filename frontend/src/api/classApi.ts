import apiClient from "@/api/axios"
import { CLASSES_LIST, CLASSES_DETAIL } from "@/api/endpoints"

/**
 * Fetch all available classes from the backend.
 * Returns the response data array directly.
 * Error handling is delegated to the Axios response interceptor.
 */
export async function getClasses() {
  const response = await apiClient.get(CLASSES_LIST)
  return response.data
}

/**
 * Fetch a single class by ID.
 * Returns the response data object directly.
 * Error handling (including 404) is delegated to the Axios response interceptor.
 */
export async function getClassById(classId: string) {
  const response = await apiClient.get(CLASSES_DETAIL(classId))
  return response.data
}
