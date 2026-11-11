import apiClient from "@/api/axios"
import { HOLDS_CREATE } from "@/api/endpoints"

export interface HoldResponse {
  holdId: string
  classId: string
  studentId: string
  status: "HELD" | "CONFIRMED" | "CANCELLED"
  expiresAt: string
}

/**
 * Creates a seat hold for the given class on behalf of a student.
 *
 * The X-Student-Id header is set explicitly here (in addition to the
 * request interceptor) to guarantee it is present even before localStorage
 * is updated by the caller.
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
