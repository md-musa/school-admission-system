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

export async function createClass(data: CreateClassPayload): Promise<ClassItem> {
  const response = await apiClient.post<ClassItem>(CLASSES_CREATE, data)
  return response.data
}

export async function getClasses(): Promise<ClassItem[]> {
  const response = await apiClient.get<ClassItem[]>(CLASSES_LIST)
  return response.data
}

export async function getClassById(classId: string): Promise<ClassItem> {
  const response = await apiClient.get<ClassItem>(CLASSES_DETAIL(classId))
  return response.data
}
