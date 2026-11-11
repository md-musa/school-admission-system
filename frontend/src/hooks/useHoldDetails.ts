import { useQuery } from "@tanstack/react-query"
import { getHoldById, type HoldResponse } from "@/api/holdApi"
import { QUERY_KEYS } from "@/lib/queryKeys"

/**
 * Hook that fetches details of an admission hold.
 *
 * Requirements:
 * - Polls every 5 seconds if status is "HELD"
 * - Stops polling once status is "CONFIRMED", "EXPIRED", or "CANCELLED"
 * - Refetches on window focus
 */
export function useHoldDetails(holdId: string | undefined) {
  return useQuery<HoldResponse>({
    queryKey: QUERY_KEYS.holds.detail(holdId ?? ""),
    queryFn: () => getHoldById(holdId!),
    enabled: Boolean(holdId),
    refetchInterval: (query) => {
      const data = query.state.data
      // Poll every 5 seconds only while active "HELD"
      if (data?.status === "HELD") {
        return 5_000
      }
      return false
    },
    refetchOnWindowFocus: true,
  })
}
