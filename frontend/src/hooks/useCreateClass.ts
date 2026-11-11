import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { createClass, type CreateClassPayload, type ClassItem } from "@/api/classApi"
import { QUERY_KEYS } from "@/lib/queryKeys"
import type { ApiError } from "@/api/axios"

export function useCreateClass() {
  const queryClient = useQueryClient()

  return useMutation<ClassItem, ApiError, CreateClassPayload>({
    mutationFn: (payload) => createClass(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.classes.all })
      toast.success("Class Created Successfully!", {
        description: `"${data.name}" (${data.totalSeats} seats) has been added to the system.`,
      })
    },
    onError: (error) => {
      toast.error("Failed to Create Class", {
        description: error?.message ?? "An unexpected error occurred. Please try again.",
      })
    },
  })
}
