import { useQuery } from "@tanstack/react-query"
import { getClassById } from "@/api/classApi"
import { QUERY_KEYS } from "@/lib/queryKeys"

/**
 * Hook that fetches a single class by ID.
 *
 * - Query is disabled when classId is absent or empty.
 * - Uses centralized query key: ["classes", classId].
 * - Inherits retry: 1 and refetchOnWindowFocus from QueryClient defaults.
 */
export function useClassDetails(classId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.classes.detail(classId ?? ""),
    queryFn: () => getClassById(classId!),
    enabled: Boolean(classId),
  })
}
