import { useQuery } from "@tanstack/react-query"
import { getClassById } from "@/api/classApi"
import { QUERY_KEYS } from "@/lib/queryKeys"


export function useClassDetails(classId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.classes.detail(classId ?? ""),
    queryFn: () => getClassById(classId!),
    enabled: Boolean(classId),
  })
}
