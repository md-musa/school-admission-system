import apiClient from "@/api/axios"
import { HOLDS_CREATE, HOLDS_DETAIL, ME_HOLDS } from "@/api/endpoints"

export type HoldStatus = "HELD" | "CONFIRMED" | "CANCELLED" | "EXPIRED"

export interface HoldResponse {
  holdId: string
  classId: string
  studentId: string
  status: HoldStatus
  expiresAt: string
}

export interface StudentApplicationItem {
  holdId: string
  classId: string
  className?: string
  studentId?: string
  status: HoldStatus
  expiresAt: string
  createdAt?: string
}

/**
 * Creates a seat hold for the given class on behalf of a student.
 */
export async function createHold(
  classId: string,
  studentId: string
): Promise<HoldResponse> {
  const response = await apiClient.post<HoldResponse>(
    HOLDS_CREATE(classId),
    {}, // empty body as required by the API
    { headers: { "X-Student-Id": studentId } }
  )
  return response.data
}

/**
 * Fetches admission hold details by ID.
 * Returns response data directly, errors processed by Axios interceptor.
 */
export async function getHoldById(holdId: string): Promise<HoldResponse> {
  const response = await apiClient.get<HoldResponse>(HOLDS_DETAIL(holdId))
  return response.data
}

/**
 * Fetches all holds/applications belonging to the given student ID.
 * Sends the X-Student-Id header.
 */
export async function getMyHolds(studentId: string): Promise<StudentApplicationItem[]> {
  const response = await apiClient.get<StudentApplicationItem[]>(ME_HOLDS, {
    headers: { "X-Student-Id": studentId },
  })
  return response.data
}
