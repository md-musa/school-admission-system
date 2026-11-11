import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { cancelHold } from "@/api/holdApi"
import { getStudentId } from "@/lib/studentId"
import { QUERY_KEYS } from "@/lib/queryKeys"
import type { ApiError } from "@/api/axios"

interface CancelHoldVariables {
  holdId: string
  classId?: string
  studentId?: string
}

export function useCancelHold() {
  const queryClient = useQueryClient()

  return useMutation<void, ApiError, CancelHoldVariables>({
    mutationFn: ({ holdId, studentId }) => {
      const activeStudentId = studentId || getStudentId()
      if (!activeStudentId) {
        return Promise.reject({
          message: "A valid Student ID is required to cancel your application.",
          status: 400,
          isNetworkError: false,
        } as ApiError)
      }
      return cancelHold(holdId, activeStudentId)
    },

    onSuccess: (_data, variables) => {
      const activeStudentId = variables.studentId || getStudentId()

      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.holds.detail(variables.holdId),
      })

      if (activeStudentId) {
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.holds.me(activeStudentId),
        })
      }

      if (variables.classId) {
        void queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.classes.detail(variables.classId),
        })
      }

      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.classes.all,
      })

      toast.success("Application Cancelled", {
        description: "Your admission hold has been cancelled and the seat has been released.",
      })
    },

    onError: (error) => {
      toast.error("Cancellation Failed", {
        description: error?.message ?? "Failed to cancel admission hold. Please try again.",
      })
    },
  })
}
