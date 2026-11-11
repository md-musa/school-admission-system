import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { confirmHold, type ConfirmHoldResponse } from "@/api/holdApi"
import { getStudentId } from "@/lib/studentId"
import { QUERY_KEYS } from "@/lib/queryKeys"
import type { ApiError } from "@/api/axios"

interface ConfirmHoldVariables {
  holdId: string
  classId?: string
  studentId?: string
}

export function useConfirmHold() {
  const queryClient = useQueryClient()

  return useMutation<ConfirmHoldResponse, ApiError, ConfirmHoldVariables>({
    mutationFn: ({ holdId, studentId }) => {
      const activeStudentId = studentId || getStudentId()
      if (!activeStudentId) {
        return Promise.reject({
          message: "A valid Student ID is required to confirm admission.",
          status: 400,
          isNetworkError: false,
        } as ApiError)
      }
      return confirmHold(holdId, activeStudentId)
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

      toast.success("Admission Confirmed!", {
        description: "Your seat reservation has been permanently confirmed.",
      })
    },

    onError: (error) => {
      toast.error("Confirmation Failed", {
        description: error?.message ?? "Failed to confirm admission hold. Please try again.",
      })
    },
  })
}
