import { useQuery } from "@tanstack/react-query"
import { getMyHolds, type StudentApplicationItem } from "@/api/holdApi"
import { getStudentId } from "@/lib/studentId"
import { QUERY_KEYS } from "@/lib/queryKeys"

/**
 * Hook that fetches all admission applications for the current student.
 *
 * Requirements:
 * - Reads Student ID from the Student ID utility (localStorage).
 * - Disables query execution if Student ID is missing or invalid.
 * - Polls every 5 seconds while at least one application is in "HELD" status.
 * - Stops polling when no applications are "HELD".
 * - Refetches on window focus.
 */
export function useMyHolds() {
  const studentId = getStudentId()

  return useQuery<StudentApplicationItem[]>({
    queryKey: QUERY_KEYS.holds.me(studentId ?? ""),
    queryFn: () => getMyHolds(studentId!),
    enabled: Boolean(studentId),
    refetchInterval: (query) => {
      const data = query.state.data
      const hasActiveHeld = data?.some((app) => app.status === "HELD")
      return hasActiveHeld ? 5_000 : false
    },
    refetchOnWindowFocus: true,
  })
}
