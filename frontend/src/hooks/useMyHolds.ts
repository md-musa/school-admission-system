import { useQuery } from "@tanstack/react-query"
import { getMyHolds, type StudentApplicationItem } from "@/api/holdApi"
import { getStudentId } from "@/lib/studentId"
import { useStudent } from "@/context/StudentContext"
import { QUERY_KEYS } from "@/lib/queryKeys"

export function useMyHolds(overrideStudentId?: string) {
  let contextStudentId = ""
  try {
    const student = useStudent()
    contextStudentId = student.studentId
  } catch {
  }

  const effectiveId = overrideStudentId || contextStudentId || getStudentId() || ""
  const isValid = effectiveId.length === 17

  return useQuery<StudentApplicationItem[]>({
    queryKey: QUERY_KEYS.holds.me(effectiveId),
    queryFn: () => getMyHolds(effectiveId),
    enabled: isValid,
    refetchInterval: (query) => {
      const data = query.state.data
      const hasActiveHeld = data?.some((app) => app.status === "HELD")
      return hasActiveHeld ? 5_000 : false
    },
    refetchOnWindowFocus: true,
  })
}
