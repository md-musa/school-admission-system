import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios"

import { STORAGE_KEYS } from "@/constants/storageKeys"

// ── Normalised error shape ─────────────────────────────────────────────────

export interface ApiError {
  message: string
  status: number | null
  isNetworkError: boolean
}

// ── Helpers ────────────────────────────────────────────────────────────────

/** Returns the stored student ID string, or null when absent / blank. */
function getStudentId(): string | null {
  const id = localStorage.getItem(STORAGE_KEYS.STUDENT_ID)
  return id && id.trim() !== "" ? id.trim() : null
}

/** Map an HTTP status code to a human-readable fallback message. */
function statusMessage(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request or input. Please check your data and try again."
    case 404:
      return "The requested resource was not found."
    case 409:
      return "This action conflicts with the current state. Please refresh and try again."
    case 500:
      return "An internal server error occurred. Please try again later."
    default:
      return `Unexpected error (HTTP ${status}).`
  }
}

// ── Axios instance ─────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10_000, // 10 seconds
})

// ── Request interceptor — attach X-Student-Id when available ───────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const studentId = getStudentId()

    if (studentId !== null) {
      // Preserve any headers already set; treat the ID as a string
      config.headers.set("X-Student-Id", studentId)
    }

    return config
  },
  (error: unknown) => Promise.reject(error)
)

// ── Response interceptor — normalise errors ────────────────────────────────

apiClient.interceptors.response.use(
  // Pass successful responses straight through
  (response) => response,

  (error: AxiosError<{ message?: string; error?: string }>) => {
    // Build a normalised ApiError and always reject with it so callers
    // receive a consistent shape regardless of the failure type.
    const apiError: ApiError = {
      message: "An unexpected error occurred.",
      status: null,
      isNetworkError: false,
    }

    if (error.code === "ECONNABORTED") {
      // Axios timeout
      apiError.message =
        "The request timed out. Please check your connection and try again."
      apiError.isNetworkError = true
    } else if (!error.response) {
      // No response — network / CORS / backend down
      apiError.message =
        "Unable to reach the server. Please check your connection."
      apiError.isNetworkError = true
    } else {
      const { status, data } = error.response
      apiError.status = status

      // Prefer a backend-supplied message when it looks safe and meaningful
      const backendMessage =
        typeof data?.message === "string" && data.message.trim() !== ""
          ? data.message.trim()
          : typeof data?.error === "string" && data.error.trim() !== ""
            ? data.error.trim()
            : null

      apiError.message = backendMessage ?? statusMessage(status)
    }

    return Promise.reject(apiError)
  }
)

export default apiClient
