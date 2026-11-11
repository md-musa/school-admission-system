import { useQuery } from "@tanstack/react-query"
import { getHoldById, type HoldResponse } from "@/api/holdApi"
import { QUERY_KEYS } from "@/lib/queryKeys"

export function useHoldDetails(holdId: string | undefined) {
  return useQuery<HoldResponse>({
    queryKey: QUERY_KEYS.holds.detail(holdId ?? ""),
    queryFn: () => getHoldById(holdId!),
    enabled: Boolean(holdId),
    refetchInterval: (query) => {
      const data = query.state.data
      if (data?.status === "HELD") {
        return 5_000
      }
      return false
    },
    refetchOnWindowFocus: true,
  })
}
