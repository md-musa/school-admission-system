import apiClient from "@/api/axios"
import { CLASSES_LIST } from "@/api/endpoints"

/**
 * Fetch all available classes from the backend.
 * Returns the response data array directly.
 * Error handling is delegated to the Axios response interceptor.
 */
export async function getClasses() {
  const response = await apiClient.get(CLASSES_LIST)
  return response.data
}
