import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { createHold, type HoldResponse } from "@/api/holdApi"
import { saveStudentId } from "@/lib/studentId"
import { QUERY_KEYS } from "@/lib/queryKeys"
import type { ApiError } from "@/api/axios"

interface CreateHoldVariables {
  classId: string
  studentId: string
}

export function useCreateHold() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation<HoldResponse, ApiError, CreateHoldVariables>({
    mutationFn: ({ classId, studentId }) => createHold(classId, studentId),

    onSuccess: (data, variables) => {
      saveStudentId(variables.studentId)

      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.classes.all })
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.classes.detail(variables.classId),
      })

      toast.success("Seat Reserved!", {
        description: "Your seat has been temporarily held. Complete your application before it expires.",
      })

      navigate(`/holds/${data.holdId}`)
    },

    onError: (error) => {
      toast.error("Application Failed", {
        description: error?.message ?? "An unexpected error occurred. Please try again.",
      })
    },
  })
}
