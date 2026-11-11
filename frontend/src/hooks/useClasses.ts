import { useQuery } from "@tanstack/react-query"
import { getClasses } from "@/api/classApi"
import { QUERY_KEYS } from "@/lib/queryKeys"

/**
 * Hook that fetches the list of classes.
 *
 * - Refetches every 5 seconds (refetchInterval) for live seat availability.
 * - Refetches when the browser window regains focus (inherited from QueryClient default).
 * - staleTime is intentionally low here so the interval actually fires.
 */
export function useClasses() {
  return useQuery({
    queryKey: QUERY_KEYS.classes.all,
    queryFn: getClasses,
    staleTime: 0,              // always treat data as stale so interval refetches work
    refetchInterval: 5_000,    // poll every 5 seconds
    refetchOnWindowFocus: true,
  })
}
