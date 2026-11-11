import apiClient from "@/api/axios"
import {
  HOLDS_CREATE,
  HOLDS_DETAIL,
  HOLDS_CONFIRM,
  HOLDS_CANCEL,
  ME_HOLDS,
} from "@/api/endpoints"

export type HoldStatus = "HELD" | "CONFIRMED" | "CANCELLED" | "EXPIRED"

export interface HoldResponse {
  holdId: string
  classId: string
  studentId: string
  status: HoldStatus
  expiresAt: string
}

export interface ConfirmHoldResponse {
  holdId: string
  status: "CONFIRMED"
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

export async function createHold(
  classId: string,
  studentId: string
): Promise<HoldResponse> {
  const response = await apiClient.post<HoldResponse>(
    HOLDS_CREATE(classId),
    {},
    { headers: { "X-Student-Id": studentId } }
  )
  return response.data
}

export async function getHoldById(holdId: string): Promise<HoldResponse> {
  const response = await apiClient.get<HoldResponse>(HOLDS_DETAIL(holdId))
  return response.data
}

export async function confirmHold(
  holdId: string,
  studentId: string
): Promise<ConfirmHoldResponse> {
  const response = await apiClient.post<ConfirmHoldResponse>(
    HOLDS_CONFIRM(holdId),
    null,
    { headers: { "X-Student-Id": studentId } }
  )
  return response.data
}

export async function cancelHold(
  holdId: string,
  studentId: string
): Promise<void> {
  await apiClient.delete(HOLDS_CANCEL(holdId), {
    headers: { "X-Student-Id": studentId },
  })
}

export async function getMyHolds(studentId: string): Promise<StudentApplicationItem[]> {
  const response = await apiClient.get<StudentApplicationItem[]>(ME_HOLDS, {
    headers: { "X-Student-Id": studentId },
  })
  return response.data
}
